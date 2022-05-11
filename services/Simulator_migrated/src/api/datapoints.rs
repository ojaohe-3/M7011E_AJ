use std::ops::Deref;

use actix_web::{
    get,
    web::{self, Json, Path, Data},
    Scope,
};
use serde::{Deserialize, Serialize};

use crate::{
    app::AppState,
    handlers::{data_handler, simulation_handler::Tickets}, models::reports::{ManagerReport, ConsumerReport, WeatherReportStore, ProsumerReport},
};

#[derive(Serialize, Deserialize)]
pub struct MemberInfo {
    id: String,
    size: Option<usize>,
}

#[get("/manager/{id}/{size}")]
pub async fn get_manager_datapoints(
    path: Path<MemberInfo>,
    data: web::Data<AppState>,
) -> Json<Vec<ManagerReport>> {
    let info = path.into_inner();
    let data = data
        .sim
        .lock()
        .await
        .data_handler
        .get_manager_data(&info.id, info.size.or(Some(100)).unwrap());
    Json(data)
}

#[get("/prosumer/{id}/{size}")]
pub async fn get_prosumer_datapoints(
    path: Path<MemberInfo>,
    data: web::Data<AppState>,
) -> Json<Vec<ProsumerReport>> {
    let info = path.into_inner();
    let data = data
        .sim
        .lock()
        .await
        .data_handler
        .get_prosumer_data(&info.id, info.size.or(Some(100)).unwrap());
    Json(data)
}
#[get("/consumer/{size}")]
pub async fn get_consumer_datapoints(
    path: Path<usize>,
    data: web::Data<AppState>,
) -> Json<Vec<ConsumerReport>> {
    let size = path.into_inner();
    let data = data
        .sim
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
pub async fn get_weather_datapoints(
    path: Path<usize>,
    data: web::Data<AppState>,
) -> Json<Vec<WeatherReportStore>> {
    let size = path.into_inner();
    let data = data
        .sim
        .lock()
        .await
        .data_handler
        .get_weather_data(size)
        .into_iter()
        .cloned()
        .collect();
    Json(data)
}

#[get("/tickets/source/{id}")]
pub async fn get_produced_tickets(id: Path<String>, data: Data<AppState>) -> Json<Tickets>{
    let res = data.sim.lock().await.get_source_tickets(&id);
    Json(res)
}

#[get("/tickets/consumers/{time}")]
pub async fn get_consumer_tickets(id: Path<String>, data: Data<AppState>) -> Json<Tickets>{
    let res = data.sim.lock().await.get_target_tickets(&id);
    Json(res)
}
pub fn construct_service() -> Scope {
    web::scope("/data")
        .service(get_manager_datapoints)
        .service(get_prosumer_datapoints)
        .service(get_consumer_datapoints)
        .service(get_weather_datapoints)
}
