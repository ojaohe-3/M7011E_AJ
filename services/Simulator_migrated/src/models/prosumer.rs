use std::borrow::BorrowMut;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::handlers::weather_handler::{weather_singleton, WeatherReport};

use super::node::{Asset, Component};
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

    pub fn input(&mut self, ratio: f64) -> f64 {
        let mut give = ratio * self.max_charge;
        give = give.clamp(0., self.capacity - self.current);
        self.current += give;
        give
    }

    pub fn output(&mut self, ratio: f64) -> f64 {
        let mut take = self.max_output * ratio;
        take = take.clamp(0., self.current);
        self.current -= take;
        take
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]

pub struct Prosumer {
    pub id: String,
    pub status: bool,
    pub batteries: Vec<Battery>,
    pub turbine: Vec<Turbine>,
    pub input_ratio: f64,
    pub output_ratio: f64,
    pub timeout: f64,
    pub total_production: f64,
    pub total_stored: f64,
}

impl Prosumer {
    pub fn new(
        status: bool,
        batteries: Vec<Battery>,
        turbine: Vec<Turbine>,
        input_ratio: f64,
        output_ratio: f64,
        id: String,
    ) -> Self {
        Self {
            status,
            batteries,
            turbine,
            input_ratio,
            output_ratio,
            id,
            timeout: 0.,
            total_production: 0.,
            total_stored: 0.,
        }
    }
    pub fn set_status(&mut self, status: bool) {
        self.status = status;
    }

    /// Set the prosumer's batteries.
    pub fn set_batteries(&mut self, batteries: Vec<Battery>) {
        self.batteries = batteries;
    }
}

impl Component<Prosumer> for Prosumer {
    fn tick(&mut self, elapsed: f64) {
        if self.timeout > 0. {
            self.status = false;
            self.timeout -= elapsed;
        }

        let s = weather_singleton();
        let report = &s.inner.lock().unwrap().cache;
        let wind_speed = match report {
            Some(v) => v.wind_speed,
            None => 0.,
        };

        if self.status {
            self.total_production = self
                .turbine
                .iter()
                .map(|t| t.profile(wind_speed) * elapsed)
                .sum();
        }
        let bs: &mut Vec<Battery> = &mut self.batteries;
        for b in bs {
            let inp =  b.input(self.input_ratio);
            let out = b.output(self.output_ratio);
            let net = out - inp;
            self.total_production += net;
            if(self.total_production < 0.){
                b.current -= inp;
                self.total_production = 0.;
            }
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
    let p: &mut Prosumer = &mut Component::new(Prosumer::new(
        true,
        vec![Battery::new(1000., 0., 100., 100.)],
        vec![Turbine::new(1000.)],
        1.,
        0.,
        "1".to_string(),
    ));
    let s = weather_singleton();
    s.inner.lock().unwrap().set_cache(WeatherReport {
        temp: 300.,
        wind_speed: 0.,
    });
    assert_eq!(p.total_production, 0.);
    assert_eq!(p.total_stored, 0.);

    s.inner.lock().unwrap().set_cache(WeatherReport {
        temp: 300.,
        wind_speed: 11.,
    });
    p.tick(1.);
    assert!(p.total_production < p.turbine[0].max_production);
    assert!(p.total_stored > 0.);
    s.inner.lock().unwrap().set_cache(WeatherReport {
        temp: 300.,
        wind_speed: 14.,
    });
    p.tick(1.);
    assert_eq!(p.total_production, p.turbine[0].max_production - p.batteries[0].max_charge);
    assert!(p.total_stored > 0.);
    s.inner.lock().unwrap().set_cache(WeatherReport {
        temp: 300.,
        wind_speed: 25.,
    });
    p.tick(1.);
    assert_eq!(p.total_production, 0.);
    assert!(p.total_stored > 0.);
    s.inner.lock().unwrap().set_cache(WeatherReport {
        temp: 300.,
        wind_speed: 2.,
    });
    p.tick(1.);
    assert_eq!(p.total_production, 0.);
    assert!(p.total_stored > 0.);
}
