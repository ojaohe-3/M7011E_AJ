use std::time::Instant;

use reqwest::ClientBuilder;
use serde::{Deserialize, Serialize};
use tokio::io::AsyncReadExt;

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

struct WeatherResponse {
    lat: f64,
    lon: f64,
    temp: f64,
    speed: f64,
    last_updated: f64,
}

impl WeatherHandler {
    pub fn new() -> Self {
        Self {
            cache: None,
            last_fetch: Instant::now(),
        }
    }
    /// Fetch Weather report from the Weather api service if specified
    pub async fn fetch_report(url: String, lat: String, lon: String) -> Result<WeatherReport, ()> {
        let cert = {
            let buf = &mut Vec::new();
            tokio::fs::File::open("cert.pem")
                .await
                .unwrap()
                .read_to_end(buf)
                .await
                .unwrap();

            reqwest::Certificate::from_pem(buf).unwrap()
        };

        let client = ClientBuilder::new()
            .add_root_certificate(cert)
            .danger_accept_invalid_certs(true) // FIXME: temp
            // .https_only(true)
            .build()
            .unwrap();

        let resp = client
            .get(format!("{}/{}/{}", url, lat, lon)) //.query(&[("lat", lat), ("lon", lon)])
            .send()
            .await
            .ok();
        if let Some(resp) = resp {
            // let t = resp.text().await.unwrap();
            // println!("{}", t);
            let data = resp.json::<WeatherResponse>().await.unwrap();
            return Ok(WeatherReport {
                temp: data.temp,
                wind_speed: data.speed,
            });
        }
        Err(())
    }
}
