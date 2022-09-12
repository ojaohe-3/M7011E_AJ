use mongodb::Database;
use rand::prelude::IteratorRandom;
use rand::thread_rng;
// use serde::{Deserialize, Serialize};
use time::Instant;
// use tokio::fs::{File, OpenOptions};
// use tokio::io::{AsyncReadExt, AsyncWriteExt};

use crate::db::datapoints_document::DataPointsDocument;
use crate::models::reports::{ConsumerReport, ManagerReport, ProsumerReport, WeatherReportStore};

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
            all[size..(all.len() - 1)].to_vec()
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
            all[size..(all.len() - 1)].to_vec()
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

    /// Dumps a sample of current data to  database.
    pub async fn flush(&mut self, db: Database) -> Result<(), mongodb::error::Error> {
        DataPointsDocument::insert_consumers(db.clone(), &self.consumer_reports).await?;
        self.consumer_reports.clear();
        DataPointsDocument::insert_prosumers(db.clone(), &self.prosumer_reports).await?;
        self.prosumer_reports.clear();
        DataPointsDocument::insert_managers(db.clone(), &self.manager_reports).await?;
        self.manager_reports.clear();
        Ok(())
    }

    /// Checks weather or not we excedes data_handlers invariance, in case we have a single data list that
    /// excede the const of MAX_DATA_ENTRIES we flush all data
    pub async fn check_status(&mut self, db: Database) -> Result<(), mongodb::error::Error> {
        if self.manager_reports.len() >= DataHandler::MAX_DATA_ENTRIES
            || self.prosumer_reports.len() >= DataHandler::MAX_DATA_ENTRIES
            || self.consumer_reports.len() >= DataHandler::MAX_DATA_ENTRIES
            || self.weather_reports.len() >= DataHandler::MAX_DATA_ENTRIES
        {
            self.flush(db).await?;
        }
        Ok(())
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

    pub fn last_weather(&self) -> Option<&WeatherReportStore> {
        self.last_weather.as_ref()
    }
}
