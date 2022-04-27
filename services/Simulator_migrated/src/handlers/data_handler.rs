use std::io::ErrorKind;

use futures_util::Future;
use futures_util::future::PollFn;
use rand::prelude::IteratorRandom;
use rand::thread_rng;
use serde::{Deserialize, Serialize};
use time::Instant;
use tokio::fs::{File, OpenOptions};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

use super::weather_handler::WeatherReport;

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

#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct WeatherReportStore {
    temp: f64,
    wind_speed: f64,
    time_stamp: f64,
}

#[derive(Debug)]
pub struct DataHandler {
    pub prosumer_reports: Vec<ProsumerReport>,
    pub manager_reports: Vec<ManagerReport>,
    pub consumer_reports: Vec<ConsumerReport>,
    pub weather_reports: Vec<WeatherReportStore>,
    pub time_from_start: Instant,
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
        }
    }

    pub fn sample_managers_data(&self) -> Vec<&ManagerReport> {
        let mut rng = thread_rng();
        self.manager_reports.iter().choose_multiple(&mut rng, 100)
    }
    pub fn sample_prosumers_data(&self) -> Vec<&ProsumerReport> {
        let mut rng = thread_rng();
        self.prosumer_reports.iter().choose_multiple(&mut rng, 100)
    }
    pub fn sample_consumers_data(&self) -> Vec<&ConsumerReport> {
        let mut rng = thread_rng();
        self.consumer_reports.iter().choose_multiple(&mut rng, 100)
    }

    pub async fn flush(&mut self) -> std::io::Result<()> {
        if self.manager_reports.len() > 100 {
            let mut f = OpenOptions::new().write(true).create(true).append(true).open("./dat/managers_data.bin").await?;
            f.write_all(&bincode::serialize(&self.sample_managers_data()).unwrap()).await?;
            self.manager_reports.clear();
            f.flush().await?;
        }

        if self.prosumer_reports.len() > 100 {
            let mut f = OpenOptions::new().write(true).create(true).append(true).open("./dat/prosumers_data.bin").await?;
            f.write_all(&bincode::serialize(&self.sample_prosumers_data()).unwrap()).await?;
            self.prosumer_reports.clear();
            f.flush().await?;
        }

        if self.consumer_reports.len() > 100 {
            let mut f = OpenOptions::new().write(true).create(true).append(true).open("./dat/consumers_data.bin").await?;
            f.write_all(&bincode::serialize(&self.sample_consumers_data()).unwrap()).await?;
            self.consumer_reports.clear();
            f.flush().await?;
        }

        if (self.weather_reports.len() > 100) {
            let mut f = OpenOptions::new().write(true).create(true).append(true).open("./dat/weather_data.bin").await?;
            f.write_all(&bincode::serialize(&self.weather_reports).unwrap()).await?;
            self.weather_reports.clear();
            f.flush().await?;
        }

        Ok(())
    }

    // TODO: Fix dynamic sized alloc when fetching data
    // pub async fn get_old_manager_data(&self) -> Result<Vec<ManagerReport>,std::io::Error> {
    //     let mut f = File::open("manager_data").await?;
    //     let mut buf : Vec<u8> = Vec::new();
    //     f.read_to_end(buf).await?;
    //     if buf.len() > 0 {

    //         let mut bytes: &[u8; 1000]; //FIXME: this will run out of bounds
    //         for (i, byte) in buf.iter().enumerate() {
    //             bytes[i] = *byte;
    //         }
    //         match bincode::deserialize(bytes){
    //             Ok(v) => return Ok(v),
    //             Err(e) => todo!(),
    //         }
    //     }
    //     Err(std::io::Error::new(ErrorKind::NotFound, "No Data Found"))
    // }

    // pub async fn get_old_prosumer_data(&self) -> Result<Vec<ProsumerReport>,std::io::Error> {
    //     let mut f = File::open("prosumer_data").await?;
    //     let mut buf : Vec<u8> = Vec::new();
    //     f.read_to_end(buf).await?;
    //     if buf.len() > 0 {
    //         let mut bytes: &[u8] = &[0; 1000];//FIXME: this will run out of bounds
    //         for (i, byte) in buf.iter().enumerate() {
    //             bytes[i] = *byte;
    //         }
    //         match bincode::deserialize(bytes){
    //             Ok(v) => return Ok(v),
    //             Err(e) => todo!(),
    //         }
    //     }
    //     Err(std::io::Error::new(ErrorKind::NotFound, "No Data Found"))
    // }

    // pub async fn get_old_consumer_data(&self) -> Result<Vec<ConsumerReport>,std::io::Error> {
    //     let mut f = File::open("consumer_data").await?;
    //     let mut buf : Vec<u8> = Vec::new();
    //     f.read_to_end(&mut buf).await?;
    //     if buf.len() > 0 {

    //         let mut bytes: &[u8; 1000];//FIXME: this will run out of bounds
    //         for (i, byte) in buf.iter().enumerate() {
    //             bytes[i] = *byte;
    //         }
    //         match bincode::deserialize(bytes){
    //             Ok(v) => return Ok(v),
    //             Err(e) => todo!(),
    //         }
    //     }
    //     Err(std::io::Error::new(ErrorKind::NotFound, "No Data Found"))
    // }

    pub async fn check_status(&mut self) {
        if self.manager_reports.len() >= DataHandler::MAX_DATA_ENTRIES
            || self.prosumer_reports.len() >= DataHandler::MAX_DATA_ENTRIES
            || self.consumer_reports.len() >= DataHandler::MAX_DATA_ENTRIES
            || self.weather_reports.len() >= DataHandler::MAX_DATA_ENTRIES
        {
            self.flush().await.expect("failed to flush");
        }
    }

    pub fn log_prosumer(&mut self, report: ProsumerReport){
        self.prosumer_reports.push(report);
        // self.check_status()
    }
    pub fn log_manager(&mut self, report: ManagerReport) {
        self.manager_reports.push(report);
        // self.check_status()
    }
    pub fn log_consumer(&mut self, report: ConsumerReport) {
        self.consumer_reports.push(report);
        // self.check_status()
    }
    pub fn log_weather(&mut self, report: WeatherReportStore) {
        self.weather_reports.push(report);
        // self.check_status()
    }
}
