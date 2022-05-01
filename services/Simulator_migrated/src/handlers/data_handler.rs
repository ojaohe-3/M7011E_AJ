use rand::prelude::IteratorRandom;
use rand::thread_rng;
use serde::{Deserialize, Serialize};
use time::Instant;
use tokio::fs::{File, OpenOptions};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

trait Report {}

#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct ManagerReport {
    id: String,
    output: f64,
    time_stamp: f64,
    ratio: f64,
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
    id: String,
    total_production: f64,
    total_stored: f64,
    demand: f64,
    time_stamp: f64,
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
    total_demand: f64,
    time_stamp: f64,
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
#[derive(Debug)]
pub struct DataHandler {
    pub prosumer_reports: Vec<ProsumerReport>,
    pub manager_reports: Vec<ManagerReport>,
    pub consumer_reports: Vec<ConsumerReport>,
    pub weather_reports: Vec<WeatherReportStore>,
    pub time_from_start: Instant,
    last_prosumer: Option<ProsumerReport>,
    last_manager: Option<ManagerReport>,
    last_consumer: Option<ConsumerReport>,
    last_weather: Option<WeatherReportStore>,
}

impl DataHandler {
    const MAX_DATA_ENTRIES: usize = 2_000;
    pub fn new() -> Self {
        Self {
            prosumer_reports: Vec::new(),
            manager_reports: Vec::new(),
            consumer_reports: Vec::new(),
            weather_reports: Vec::new(),
            time_from_start: Instant::now(),
            last_consumer: None,
            last_manager: None,
            last_prosumer: None,
            last_weather: None,
        }
    }

    pub fn get_consumers_data(&self, size: usize) -> Vec<&ConsumerReport> {
        self.sample_consumers_data(size)
    }
    pub fn get_weather_data(&self, size: usize) -> Vec<&WeatherReportStore> {
        let mut rng = thread_rng();
        self.weather_reports.iter().choose_multiple(&mut rng, size)
    }
    pub fn get_manager_data(&self, id: &String, size: usize) -> Vec<ManagerReport> {
        let all: Vec<ManagerReport> = self
            .manager_reports
            .iter()
            .filter(|m| (*m).id.eq(id))
            .cloned()
            .collect();
        if size >= all.len() {
            all
        } else {
            all[..size].to_vec()
        }
    }
    pub fn get_prosumer_data(&self, id: &String, size: usize) -> Vec<ProsumerReport> {
        let all: Vec<ProsumerReport> = self
            .prosumer_reports
            .iter()
            .filter(|m| (*m).id.eq(id))
            .cloned()
            .collect();
        if size >= all.len() {
            all
        } else {
            all[..size].to_vec()
        }
    }

    pub fn sample_managers_data(&self, size: usize) -> Vec<&ManagerReport> {
        let mut rng = thread_rng();
        self.manager_reports.iter().choose_multiple(&mut rng, size)
    }
    pub fn sample_prosumers_data(&self, size: usize) -> Vec<&ProsumerReport> {
        let mut rng = thread_rng();
        self.prosumer_reports.iter().choose_multiple(&mut rng, size)
    }
    pub fn sample_consumers_data(&self, size: usize) -> Vec<&ConsumerReport> {
        let mut rng = thread_rng();
        self.consumer_reports.iter().choose_multiple(&mut rng, size)
    }

    /// Dumps a sample of current data to a dat file if they have more than 100 entries (otherwise ignores it).
    /// The dat files, if file does not exist, creates them with the data, otherwise extend the file,
    /// Then if we dumped data we remove all current entries.
    pub async fn flush(&mut self) -> std::io::Result<()> {
        if self.manager_reports.len() > 100 {
            let mut f = OpenOptions::new()
                .write(true)
                .create(true)
                .append(true)
                .open("./dat/managers_data.bin")
                .await?;
            f.write_all(&bincode::serialize(&self.sample_managers_data(100)).unwrap())
                .await?;
            self.manager_reports.clear();
            f.flush().await?;
        }

        if self.prosumer_reports.len() > 100 {
            let mut f = OpenOptions::new()
                .write(true)
                .create(true)
                .append(true)
                .open("./dat/prosumers_data.bin")
                .await?;
            f.write_all(&bincode::serialize(&self.sample_prosumers_data(100)).unwrap())
                .await?;
            self.prosumer_reports.clear();
            f.flush().await?;
        }

        if self.consumer_reports.len() > 100 {
            let mut f = OpenOptions::new()
                .write(true)
                .create(true)
                .append(true)
                .open("./dat/consumers_data.bin")
                .await?;
            f.write_all(&bincode::serialize(&self.sample_consumers_data(100)).unwrap())
                .await?;
            self.consumer_reports.clear();
            f.flush().await?;
        }

        if (self.weather_reports.len() > 100) {
            let mut f = OpenOptions::new()
                .write(true)
                .create(true)
                .append(true)
                .open("./dat/weather_data.bin")
                .await?;
            f.write_all(&bincode::serialize(&self.weather_reports).unwrap())
                .await?;
            self.weather_reports.clear();
            f.flush().await?;
        }

        Ok(())
    }

    /// Checks weather or not we excedes data_handlers invariance, in case we have a single data list that 
    /// excede the const of MAX_DATA_ENTRIES we flush all data
    pub async fn check_status(&mut self) {
        if self.manager_reports.len() >= DataHandler::MAX_DATA_ENTRIES
            || self.prosumer_reports.len() >= DataHandler::MAX_DATA_ENTRIES
            || self.consumer_reports.len() >= DataHandler::MAX_DATA_ENTRIES
            || self.weather_reports.len() >= DataHandler::MAX_DATA_ENTRIES
        {
            self.flush().await.expect("failed to flush");
        }
    }

    ///## Log prosumer
    /// adds an item to the report list if it was not the same as the last one
    pub fn log_prosumer(&mut self, report: ProsumerReport) {
        if let Some(lp) = &self.last_prosumer {
            if lp.eq(&report) {
                return;
            } else {
                self.last_prosumer = Some(report.clone());
            }
        } else {
            self.last_prosumer = Some(report.clone());
        }
        self.prosumer_reports.push(report);
        // self.check_status()
    }
    pub fn log_manager(&mut self, report: ManagerReport) {
        if let Some(lm) = &self.last_manager {
            if lm.eq(&report) {
                return;
            } else {
                self.last_manager = Some(report.clone());
            }
        } else {
            self.last_manager = Some(report.clone());
        }
        self.manager_reports.push(report);
        // self.check_status()
    }
    pub fn log_consumer(&mut self, report: ConsumerReport) {
        if let Some(lp) = &self.last_consumer {
            if lp.eq(&report) {
                return;
            } else {
                self.last_consumer = Some(report.clone());
            }
        } else {
            self.last_consumer = Some(report.clone());
        }
        self.consumer_reports.push(report);
        // self.check_status()
    }
    pub fn log_weather(&mut self, report: WeatherReportStore) {
        if let Some(lp) = &self.last_weather {
            if lp.eq(&report) {
                return;
            } else {
                self.last_weather = Some(report.clone());
            }
        } else {
            self.last_weather = Some(report.clone());
        }
        self.weather_reports.push(report);
        // self.check_status()
    }
}
