
#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct ProsumerReport {
    pub id: String,
    pub total_production: f64,
    pub total_stored: f64,
    pub demand: f64,
    pub delta_time: f64,
    time_date: i64,
}

use chrono::Local;
use serde::{Deserialize, Serialize};


impl ProsumerReport {
    pub fn new(
        id: String,
        total_production: f64,
        total_stored: f64,
        demand: f64,
        time_stamp: f64,
    ) -> Self {
        Self {
            id,
            total_production,
            total_stored,
            demand,
            delta_time: time_stamp,
            time_date: Local::now().timestamp_millis(),
        }
    }
}
impl PartialEq for ProsumerReport {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
            && self.total_production == other.total_production
            && self.total_stored == other.total_stored
            && self.demand == other.demand
    }
}