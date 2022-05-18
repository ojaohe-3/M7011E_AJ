use chrono::{Timelike, Utc};
use mongodb::Database;
use rand::Rng;
use serde::{Deserialize, Serialize};

use crate::{handlers::weather_handler::{ WeatherReport}, db::{ consumer_document::ConsumerDocument}};

use super::node::{Asset, Node};

pub type TimeFn = [f64; 24];
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Consumer {
    pub timefn: TimeFn,
    pub profile: f64,
    pub asset: Asset,
    pub demand: f64,
    pub id: String,
    pub network: String,
}

impl Consumer {
    pub fn new(
        timefn: Option<TimeFn>,
        profile: Option<f64>,
        asset: Option<Asset>,
        id: Option<String>,
        network: String,
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
                network,
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
                network,
            }
        }
    }
    pub fn consumption(&self, temp: f64) -> f64 {
        let now = Utc::now();
        let hour = now.hour();

        self.profile * (0.002 * (294.15 - temp).powf(2.) + self.timefn[hour as usize]) / 3.6 // kw 
    }
    pub async fn document(&self, db: Database) -> Result<mongodb::results::UpdateResult, mongodb::error::Error> {
        ConsumerDocument::update(db, self.id.to_string(), self).await
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

impl Node<Consumer> for Consumer {
    fn tick(&mut self, _elapsed: f64, weather_report: WeatherReport) {
        self.demand = self.consumption(weather_report.temp);
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
    let cm: &mut Consumer = &mut Node::new(Consumer::new(None, None, None, None, format!("")));
    cm.tick(1., WeatherReport { temp: 26.0, wind_speed: 0. });
    assert!(cm.demand > 0.);
}
