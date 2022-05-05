use std::mem::MaybeUninit;
use std::sync::{Mutex, Once};
use std::time::Instant;

use serde::{Deserialize, Serialize};
use time::Duration;
use tokio::io::AsyncReadExt;

pub struct WHReader {
    pub inner: Mutex<WeatherHandler>,
}

pub fn weather_singleton() -> &'static WHReader {
    static mut SINGLETON: MaybeUninit<WHReader> = MaybeUninit::uninit();
    static ONCE: Once = Once::new();

    unsafe {
        ONCE.call_once(|| {
            let singleton = WHReader {
                inner: Mutex::new(WeatherHandler::new()),
            };
            SINGLETON.write(singleton);
        });

        SINGLETON.assume_init_ref()
    }
}
#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub struct WeatherReport {
    pub temp: f64,       // temp in kevlin
    pub wind_speed: f64, // windspeed in knots
}

#[derive(Debug)]
pub struct WeatherHandler {
    pub cache: Option<WeatherReport>,
    last_fetch: Instant,
}
#[derive(Debug, Serialize, Deserialize, Clone, Copy)]

struct WeatherResponse{
    lat: f64,
    lon: f64,
    temp: f64,
    speed: f64,
    last_updated: f64
}

impl WeatherHandler {
    pub fn new() -> Self {
        Self {
            cache: None,
            last_fetch: Instant::now(),
        }
    }

    pub async fn fetch_report() -> Result<WeatherReport, ()> {
        //TODO: Fix the many possible errors and and handeling for that
        // fetch weather from api
        let client = reqwest::Client::new();

        let cert ={
            let mut buf = &mut Vec::new();
            tokio::fs::File::open("cert.pem")
                .await
                .unwrap()
                .read_to_end(buf).await.unwrap();
    
             reqwest::Certificate::from_pem(buf).unwrap()
        };
        
        let resp = client.get("https://localhost:2551").query(&[("lat", 65.584160), ("lon", 22.154751)]).send().await.unwrap();
        let data = resp.json::<WeatherResponse>().await.unwrap();
        // let res = reqwest::get()
        return Ok(WeatherReport {
            temp: data.temp,
            wind_speed: data.speed,
        });
    }

    /// Set the weather handler's last fetch.
    pub fn set_last_fetch(&mut self, last_fetch: Instant) {
        self.last_fetch = last_fetch;
    }

    /// Set the weather handler's cache.
    pub fn set_cache(&mut self, cache: WeatherReport) {
        self.cache = Some(cache);
    }
}
