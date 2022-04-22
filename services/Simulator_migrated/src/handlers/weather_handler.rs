
use std::sync::{Mutex, Once};
use std::time::Instant;
use std::{mem::MaybeUninit};

use serde::{Serialize, Deserialize};
use time::Duration;


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
pub struct WeatherReport{
    pub temp: f64, // temp in kevlin
    pub wind_speed: f64  // windspeed in knots
}
pub struct WeatherHandler{
    pub cache: Option<WeatherReport>,
    last_fetch: Instant,

}

impl WeatherHandler {
    const FREQ_OF_REQUEST: Duration = Duration::new(500, 0);
    pub fn new() -> Self { Self { cache: None,
    last_fetch: Instant::now()
} }

    pub fn process(&mut self){
        if self.last_fetch.elapsed() >= WeatherHandler::FREQ_OF_REQUEST{
            self.last_fetch = Instant::now();
        }
    }
    pub async fn fetch_report() -> Result<WeatherReport,()>{

        // fetch weather from api

        // let res = reqwest::get()
        return Ok(WeatherReport{
            temp: 273.15, wind_speed: 0.
        })
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