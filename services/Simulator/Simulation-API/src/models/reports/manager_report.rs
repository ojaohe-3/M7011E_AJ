use chrono::Local;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct ManagerReport {
    pub id: String,
    pub output: f64,
    pub time_stamp: f64,
    pub ratio: f64,
    pub time_date: i64,
}

impl ManagerReport {
    pub fn new(id: String, output: f64, time_stamp: f64, ratio: f64) -> Self {
        Self {
            id,
            output,
            time_stamp,
            ratio,
            time_date: Local::now().timestamp_millis(),
        }
    }
}
impl PartialEq for ManagerReport {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id && self.output == other.output && self.ratio == other.ratio
    }
}