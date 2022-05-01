use std::ops::Deref;

use actix_web::{
    get,
    web::{self, Json, Path},
    Scope,
};
use serde::{Deserialize, Serialize};

use crate::handlers::{
    data_handler::{ConsumerReport, ManagerReport, ProsumerReport, WeatherReportStore},
    simulation_handler::simulation_singleton,
};

#[derive(Serialize, Deserialize)]
pub struct MemberInfo {
    id: String,
    size: Option<usize>,
}

#[get("/manager/{id}/{size}")]
pub async fn get_manager_datapoints(path: Path<MemberInfo>) -> Json<Vec<ManagerReport>> {
    let sim = simulation_singleton();
    let info = path.into_inner();
    let data = sim
        .inner
        .lock()
        .await
        .data_handler
        .get_manager_data(&info.id, info.size.or(Some(100)).unwrap());
    Json(data)
}

#[get("/prosumer/{id}/{size}")]
pub async fn get_prosumer_datapoints(path: Path<MemberInfo>) -> Json<Vec<ProsumerReport>> {
    let sim = simulation_singleton();
    let info = path.into_inner();
    let data = sim
        .inner
        .lock()
        .await
        .data_handler
        .get_prosumer_data(&info.id, info.size.or(Some(100)).unwrap());
    Json(data)
}
#[get("/consumer/{size}")]
pub async fn get_consumer_datapoints(path: Path<usize>) -> Json<Vec<ConsumerReport>> {
    let sim = simulation_singleton();
    let size = path.into_inner();
    let data = sim
        .inner
        .lock()
        .await
        .data_handler
        .get_consumers_data(size)
        .into_iter()
        .cloned()
        .collect();
    Json(data)
}

#[get("/weather/{size}")]
pub async fn get_weather_datapoints(path: Path<usize>) -> Json<Vec<WeatherReportStore>> {
    let sim = simulation_singleton();
    let size = path.into_inner();
    let data = sim
        .inner
        .lock()
        .await
        .data_handler
        .get_weather_data(size)
        .into_iter()
        .cloned()
        .collect();
    Json(data)
}
pub fn construct_service() -> Scope {
    web::scope("/data")
        .service(get_manager_datapoints)
        .service(get_prosumer_datapoints)
        .service(get_consumer_datapoints)
        .service(get_weather_datapoints)
}
