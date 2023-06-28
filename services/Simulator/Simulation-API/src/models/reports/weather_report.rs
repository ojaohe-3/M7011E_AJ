#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct WeatherReportStore {
    temp: f64,
    wind_speed: f64,
    delta_time: f64,
    time_date: i64,
}

impl WeatherReportStore {
    pub fn new(temp: f64, wind_speed: f64, delta_time: f64) -> Self {
        Self {
            temp,
            wind_speed,
            delta_time,
            time_date: Local::now().timestamp_millis(),
        }
    }
}
impl PartialEq for WeatherReportStore {
    fn eq(&self, other: &Self) -> bool {
        self.temp == other.temp && self.wind_speed == other.wind_speed
    }
}