use chrono::{Timelike, Utc};
use rand::Rng;
use serde::{Deserialize, Serialize};

use crate::handlers::weather_handler::{weather_singleton, WeatherHandler};

use super::node::{Asset, Component};

pub type TimeFn = [f64; 24];
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Consumer {
    pub timefn: TimeFn,
    pub profile: f64,
    pub asset: Asset,
    pub demand: f64,
    pub id: String,
}

impl Consumer {
    pub fn new(
        timefn: Option<TimeFn>,
        profile: Option<f64>,
        asset: Option<Asset>,
        id: Option<String>,
    ) -> Self {
        if let Some(p) = profile {
            Self {
                timefn: if let Some(tf) = timefn {
                    tf
                } else {
                    Consumer::generate_time_fn()
                },
                profile: p,
                asset: if let Some(a) = asset {
                    a
                } else {
                    Asset::Customer1
                },
                demand: 0.,
                id: if let Some(i) = id {
                    i
                } else {
                    uuid::Uuid::new_v4().to_string()
                },
            }
        } else {
            let mut rng = rand::thread_rng();
            let r: f64 = rng.gen();
            let rd: f64 = rng.gen();

            // size is the number of individuals in a house hold as a real number, it is 2.7% weighted,
            let size = r * 4. - r * 2. + rd * 2. + 4.;
            // lamba is the variability of the the consumer to consume, this is much more weighted but tends to be a lower value.
            let lamba = r - r / 2. + rd / 2. + 1.;

            Self {
                timefn: if let Some(tf) = timefn {
                    tf
                } else {
                    Consumer::generate_time_fn()
                },
                profile: size * 0.027 + lamba * 0.5,
                asset: if let Some(a) = asset {
                    a
                } else {
                    Asset::Customer1
                },
                demand: 0.,
                id: if let Some(id) = id {
                    id
                } else {
                    uuid::Uuid::new_v4().to_string()
                },
            }
        }
    }
    pub fn consumption(&self, temp: f64) -> f64 {
        let now = Utc::now();
        let hour = now.hour();

        self.profile * (0.002 * (294.15 - temp).powf(2.) + self.timefn[hour as usize])
    }
    pub fn generate_time_fn() -> TimeFn {
        let mut rng = rand::thread_rng();
        let random: f64 = rng.gen::<f64>() * 10.;
        return [
            0.02 * random,
            0.0114 * random,
            0.011 * random,
            0.05 * random,
            0.2 * random,
            0.35 * random,
            0.6 * random,
            0.8 * random,
            0.65 * random,
            0.64 * random,
            0.56 * random,
            0.58 * random,
            0.74 * random,
            0.56 * random,
            0.3 * random,
            0.2 * random,
            0.812 * random,
            0.911 * random,
            0.922 * random,
            0.926 * random,
            0.845 * random,
            0.76 * random,
            0.311 * random,
            0.121 * random,
        ];
    }
}

impl Component<Consumer> for Consumer {
    fn tick(&mut self, elapsed: f64) {
        // TODO weather dependant demand
        let s = weather_singleton();
        let temp_report = if let Some(report) = &s.inner.lock().unwrap().cache {
            Some(report.temp)
        } else {
            None
        };
        if let Some(temp) = temp_report {
            self.demand = self.consumption(temp);
        }
    }

    fn get_asset(&self) -> Asset {
        self.asset
    }

    fn new(obj: Consumer) -> Self {
        obj
    }
}

#[tokio::test]
async fn test_demand() {
    let cm: &mut Consumer = &mut Component::new(Consumer::new(
        None,
        None,
        None,
        None,
    ));
    cm.tick(1.);
    assert_eq!(cm.demand, 0.);

    let join = tokio::spawn(async { WeatherHandler::fetch_report().await.unwrap() });
    let report = match join.await {
        Err(e) => panic!("{}", e),
        Ok(v) => v,
    };
    weather_singleton().inner.lock().unwrap().set_cache(report);

    cm.tick(1.);
    assert_ne!(cm.demand, 0.);
}
