use serde::{Deserialize, Serialize};

trait Report {}

#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct ManagerReport {
    pub id: String,
    pub output: f64,
    pub time_stamp: f64,
    pub ratio: f64,
    //TODO: add more report attributes
}

impl ManagerReport {
    pub fn new(id: String, output: f64, time_stamp: f64, ratio: f64) -> Self {
        Self {
            id,
            output,
            time_stamp,
            ratio,
        }
    }
}
impl PartialEq for ManagerReport {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id && self.output == other.output && self.ratio == other.ratio
    }
}

impl Report for ManagerReport {}
#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct ProsumerReport {
    pub id: String,
    pub total_production: f64,
    pub total_stored: f64,
    pub demand: f64,
    pub time_stamp: f64,
}

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
            time_stamp,
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

impl Report for ProsumerReport {}
#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct ConsumerReport {
    pub total_demand: f64,
    pub time_stamp: f64,
}

impl ConsumerReport {
    pub fn new(total_demand: f64, time_stamp: f64) -> Self {
        Self {
            total_demand,
            time_stamp,
        }
    }
}
impl PartialEq for ConsumerReport {
    fn eq(&self, other: &Self) -> bool {
        self.total_demand == other.total_demand
    }
}

impl Report for ConsumerReport {}
#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct WeatherReportStore {
    temp: f64,
    wind_speed: f64,
    time_stamp: f64,
}

impl WeatherReportStore {
    pub fn new(temp: f64, wind_speed: f64, time_stamp: f64) -> Self {
        Self {
            temp,
            wind_speed,
            time_stamp,
        }
    }
}
impl PartialEq for WeatherReportStore {
    fn eq(&self, other: &Self) -> bool {
        self.temp == other.temp && self.wind_speed == other.wind_speed
    }
}

impl Report for WeatherReportStore {}