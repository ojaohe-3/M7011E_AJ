
use mongodb::Database;
use rand::Rng;
use serde::{Deserialize, Serialize};

use crate::{handlers::weather_handler::{WeatherReport}, db::prosumer_document::ProsumerDocument};

use super::{
    node::{Asset, Node},
};
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Turbine {
    max_production: f64,
}

impl Turbine {
    pub fn new(max_production: f64) -> Self {
        Self { max_production }
    }
    pub fn profile(&self, wind_speed: f64) -> f64 {
        let mut ratio = 0.0;
        if wind_speed > 3. && wind_speed < 24.6 {
            if wind_speed >= 12. {
                ratio = 1.0;
            } else {
                ratio = 1. / 12. * wind_speed;
            }
        }
        return self.max_production * ratio;
    }
}
#[derive(Clone, Debug, Serialize, Deserialize, Copy, PartialEq)]
pub struct Battery {
    capacity: f64,
    current: f64,
    max_charge: f64,
    max_output: f64,
}

impl Battery {
    pub fn new(capacity: f64, current: f64, max_charge: f64, max_output: f64) -> Self {
        Self {
            capacity,
            current,
            max_charge,
            max_output,
        }
    }
    /// How much battery is willing to accept
    pub fn input(&self, ratio: f64) -> f64 {
        let mut give = ratio * self.max_charge;
        give = give.clamp(0., self.capacity - self.current);
        // self.current += give;
        give
    }
    /// How much battery is willing to part with
    pub fn output(&self, ratio: f64) -> f64 {
        let mut take = self.max_output * ratio;
        take = take.clamp(0., self.current);
        // self.current -= take;
        take
    }
    pub fn modify(&mut self, give: f64){
        self.current += give;
    }
}
#[derive(Clone, Default,Debug, Serialize, Deserialize)]

pub struct Prosumer {
    pub id: String,
    pub status: bool,
    pub batteries: Vec<Battery>,
    pub turbines: Vec<Turbine>,
    pub input_ratio: f64,
    pub output_ratio: f64,
    #[serde(skip)]
    pub timeout: f64,
    #[serde(skip)]
    pub total_production: f64,
    pub total_stored: f64,
    pub demand: f64,
    pub network: String,
}

impl Prosumer {
    pub fn new(
        status: bool,
        batteries: Vec<Battery>,
        turbine: Vec<Turbine>,
        input_ratio: f64,
        output_ratio: f64,
        id: String,
        demand: f64,
        network: String,
    ) -> Self {
        Self {
            status,
            batteries,
            turbines: turbine,
            input_ratio,
            output_ratio,
            id,
            timeout: 0.,
            total_production: 0.,
            total_stored: 0.,
            demand,
            network,
        }
    }
    // pub fn set_status(&mut self, status: bool) {
    //     self.status = status;
    // }

    // /// Set the prosumer's batteries.
    // pub fn set_batteries(&mut self, batteries: Vec<Battery>) {
    //     self.batteries = batteries;
    // }

    pub async fn document(&self, db: Database) -> Result<mongodb::results::UpdateResult, mongodb::error::Error> {
        ProsumerDocument::update(db, &self.id.to_string(), self).await
    }
}

impl Node<Prosumer> for Prosumer {
    fn tick(&mut self, elapsed: f64, weather_report: WeatherReport) {
        //TODO: make into profile that makes sense
        let mut rng = rand::thread_rng();
        self.demand = rng.gen_range(1.0..10.);

        if self.timeout > 0. {
            self.status = false;
            self.timeout -= elapsed;
        }

        let wind_speed = weather_report.wind_speed;

        if self.status {
            self.total_production = self.turbines.iter().map(|t| t.profile(wind_speed)).sum();
        }
        let bs: &mut Vec<Battery> = &mut self.batteries;
        for b in bs {
            let inp = b.input(self.input_ratio * elapsed).clamp(0., self.total_production);
            let out = b.output(self.output_ratio * elapsed);
            self.total_production += out - inp;
            if self.total_production < 0. {
                b.current -= inp;
                self.total_production = 0.;
            }
            b.modify(inp - out);
        } // TODO Check if battery gets changed
        self.total_stored = self.batteries.iter().map(|b| b.current).sum();
    }

    fn get_asset(&self) -> Asset {
        Asset::Windturbine
    }

    fn new(obj: Prosumer) -> Self {
        obj
    }
}

#[test]
fn test_prosumer_no_output() {
    let p: &mut Prosumer = &mut Node::new(Prosumer::new(
        true,
        vec![Battery::new(1000., 0., 100., 100.)],
        vec![Turbine::new(1000.)],
        1.,
        0.,
        "1".to_string(),
        0.,
        format!(""),
    ));



    p.tick(1.,WeatherReport {
        temp: 300.,
        wind_speed: 11.,
    });
    assert!(p.total_production < p.turbines[0].max_production);
    assert!(p.total_stored > 0.);


    let cur = p.total_stored;
    p.output_ratio = 1.0;
    p.tick(1.,WeatherReport {
        temp: 300.,
        wind_speed: 0.,
    });
    
    assert_eq!(
        p.total_production,
        p.batteries[0].max_output
    );

    assert!(p.total_stored < cur);
    p.output_ratio = 0.;
    
    p.tick(1., WeatherReport {
        temp: 300.,
        wind_speed: 25.,
    });
    assert_eq!(p.total_production, 0.);
    assert_eq!(p.total_stored, 0.);
    p.tick(1., WeatherReport {
        temp: 300.,
        wind_speed: 2.,
    });

    assert_eq!(p.total_production, 0.);
    // assert!(p.total_stored > 0.);
}
