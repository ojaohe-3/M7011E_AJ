use serde::{Deserialize, Serialize};

use super::node::{Asset, Component};
use std::{
    borrow::BorrowMut,
    time::{Duration, Instant},
};



#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manager {
    pub id: String, // hash 128bit
    pub max_production: f64, // in kw
    pub current: f64, // [0, 1] range  
    pub ratio: f64, // [0, 1] range  
    pub price: f64, // price in kr
    pub status: bool, // active or not
    #[serde(skip_serializing)]
    pub last: f64, // seconds as f64
    #[serde(skip_serializing)]
    pub acc: f64, // accumilated acceleration
}

impl Manager {
    // const MAX_VELOCITY: f64 = 1.;
    const ACCELERATION: f64 = 5e-5; // the constant acceleration, it goes without saying that this converges towards a velocity of infinity unless clamped

    pub fn new(id:String, max_production: f64, current: f64, ratio: f64, price: f64, status: bool) -> Self {
        Self {
            id,
            max_production,
            current,
            ratio,
            price,
            status,
            last: 0.,
            acc: 0.,
        }
    }

    pub fn output(&self) -> f64 {
        self.current * self.max_production
    }

    /// Set the manager's current.
    pub fn set_current(&mut self, current: f64) {
        self.current = current;
    }
}

impl Component<Manager> for Manager {
    fn tick(&mut self, dt: f64){
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
    let m = Manager::new("".to_string(),1000., 0., 0., 0.05, true);
    let manager: &mut Manager = &mut Component::new(m);

    assert!(manager.status);
    assert_eq!(manager.output(), 0.);

    manager.tick(1.);
    manager.tick(1000.);
    assert_eq!(manager.output(), 0.);
    manager.ratio = 1.;
    manager.tick(1.);
    assert!(manager.output() > 0.);
    manager.tick(1000.);
    assert_eq!(manager.output(), manager.max_production);
    manager.status = false;
    manager.tick(0.1);
    assert!(manager.output() < manager.max_production);

}
