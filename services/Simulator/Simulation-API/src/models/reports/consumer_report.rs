use chrono::Local;
use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct ConsumerReport {
    pub delta_time: f64,
    pub total_demand: f64,
    pub time_stamp: f64,
    time_date: i64,
}

impl ConsumerReport {
    pub fn new(total_demand: f64, time_stamp: f64, delta_time: f64) -> Self {
        Self {
            total_demand,
            time_stamp,
            delta_time,
            time_date: Local::now().timestamp_millis(),
        }
    }
}
impl PartialEq for ConsumerReport {
    fn eq(&self, other: &Self) -> bool {
        self.total_demand == other.total_demand
    }
}