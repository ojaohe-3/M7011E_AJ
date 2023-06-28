use mongodb::Database;
use serde::{Deserialize, Serialize};

use crate::{handlers::weather_handler::WeatherReport, db::manager_document::ManagerDocument};

use super::node::{Asset, Node};



#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Manager {
    pub id: String, // hash 128bit
    pub max_production: f64, // in kw
    pub current: f64, // [0, 1] range  
    pub ratio: f64, // [0, 1] range  
    pub price: f64, // price in kr
    pub status: bool, // active or not
    pub network: String, // Network instant that is to be supplied
    #[serde(skip)]
    pub last: f64, // seconds as f64
    #[serde(skip)]
    pub acc: f64, // accumilated acceleration
}

impl Manager {
    // const MAX_VELOCITY: f64 = 1.;
    const ACCELERATION: f64 = 5e-2; 
    pub fn new(id:String, max_production: f64, current: f64, ratio: f64, price: f64, status: bool, network: String) -> Self {
        Self {
            id,
            max_production,
            current,
            ratio,
            price,
            status,
            last: 0.,
            acc: 0.,
            network
        }
    }

    pub fn output(&self) -> f64 {
        self.current * self.max_production
    }

    /// Set the manager's current.
    pub fn set_current(&mut self, current: f64) {
        self.current = current;
    }

    pub async fn document(&self, db: Database) -> Result<mongodb::results::UpdateResult, mongodb::error::Error> {
        ManagerDocument::update(db, &self.id.to_string(), self).await
    }
}

impl Node<Manager> for Manager {
    fn tick(&mut self, dt: f64, _weather_report: WeatherReport){
        self.acc += Manager::ACCELERATION / dt;
        // if self.last > 1.{
        //     self.acc = 0.;
        //     self.last = 0.;
        //     println!("second passed!")
        // }

        let mut cur = self.current;
        if self.status {
            cur += self.acc/self.max_production;//(self.acc + Manager::STEP_PER_SECOND) * dt/2. + Manager::ACCELERATION * dt.powf(2.)/2.;
        } else {
            cur -= self.acc/self.max_production;//(self.acc + Manager::STEP_PER_SECOND) * dt/2. + Manager::ACCELERATION * dt.powf(2.)/2.;
        }
        cur *= dt;
        cur = cur.clamp(0., self.ratio); // TODO make ratio the goal rather than status
        self.set_current(cur);
        self.last += dt;
        
    }
    
    fn get_asset(&self) -> Asset {
        Asset::Powerplant
    }

    fn new(obj: Manager) -> Self {
        obj
    }
}
#[test]
fn test_manager() {
    let m = Manager::new("".to_string(),1000., 0., 0., 0.05, true, format!(""));
    let manager: &mut Manager = &mut Node::new(m);
    let report = WeatherReport{ temp: 0., wind_speed: 0.};
    assert!(manager.status);
    assert_eq!(manager.output(), 0.);
    manager.tick(1000.,report);
    assert_eq!(manager.output(), 0.);
    manager.ratio = 1.;
    manager.tick(0.1,report);
    manager.tick(0.1,report);
    assert!(manager.output() > 0.);
    manager.tick(1000.,report);
    assert_eq!(manager.output(), manager.max_production);
    manager.status = false;
    manager.tick(0.1,report);
    assert!(manager.output() < manager.max_production);

}
