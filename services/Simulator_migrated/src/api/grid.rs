use actix_web::{
    get, post, put,
    web::{self, Json, Path},
};
use serde::{Deserialize, Serialize};

use crate::{
    api::{
        formats::{ResponseFormat, WebRequestError},
        members::{
            consumers::CreateConsumerInfo, managers::CreateManagerInfo,
            prosumers::CreateProsumerInfo,
        },
    },
    app::AppState,
    models::{
        consumer::{Consumer, TimeFn},
        manager::{self, Manager},
        node::{Asset, Cell, Grid},
        prosumer::Prosumer,
    },
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateMemeberInfo<T> {
    id: String,
    child: T,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PathInfo {
    x: usize,
    y: usize,
}

#[get("/")]
pub async fn get_grid(data: web::Data<AppState>) -> Json<Grid> {
    let grid = data.sim.lock().await.grid.clone();
    Json(grid)
}
#[get("/{x}/{y}")]
pub async fn get_item_at(
    path: Path<PathInfo>,
    data: web::Data<AppState>,
) -> Result<Json<Cell>, WebRequestError> {
    let info = path.into_inner();
    let data = data.sim.lock().await.grid.get_at(info.x, info.y);
    match data {
        Err(_) => Err(WebRequestError::InvalidRange),
        Ok(v) => Ok(Json(v)),
    }
}

#[post("/{x}/{y}/manager")]
pub async fn set_manager_at(
    path: Path<PathInfo>,
    body: Json<CreateMemeberInfo<CreateManagerInfo>>,
    data: web::Data<AppState>,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let info = path.into_inner();
    let cell = body.into_inner();
    let manager = cell.child;
    data.sim.lock().await.grid.set_at(
        info.x,
        info.y,
        Cell::new(cell.id.to_string(), crate::models::node::CellType::Manager),
    );
    data.sim.lock().await.add_manager(Manager::new(
        cell.id,
        manager.max_production,
        0.,
        0.,
        manager.price,
        false,
    ));

    Ok(Json(ResponseFormat::new(format!(
        "Successfully added a node to simulation at x: {}, y: {}",
        info.x, info.y
    ))))
}

#[post("/{x}/{y}/consumer")]
pub async fn set_consumer_at(
    path: Path<PathInfo>,
    body: Json<CreateMemeberInfo<CreateConsumerInfo>>,
    data: web::Data<AppState>,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let info = path.into_inner();
    let cell = body.into_inner();
    let consumer = cell.child;
    data.sim.lock().await.grid.set_at(
        info.x,
        info.y,
        Cell::new(cell.id.to_string(), crate::models::node::CellType::Manager),
    );
    data.sim.lock().await.add_consumer(Consumer::new(
        consumer.timefn,
        consumer.profile,
        consumer.asset,
        consumer.id,
    ));

    Ok(Json(ResponseFormat::new(format!(
        "Successfully added a node to simulation at x: {}, y: {}",
        info.x, info.y
    ))))
}

#[post("/{x}/{y}/prosumer")]
pub async fn set_prosumer_at(
    path: Path<PathInfo>,
    body: Json<CreateMemeberInfo<CreateProsumerInfo>>,
    data: web::Data<AppState>,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let info = path.into_inner();
    let cell = body.into_inner();
    let prosumer = cell.child;
    data.sim.lock().await.grid.set_at(
        info.x,
        info.y,
        Cell::new(cell.id.to_string(), crate::models::node::CellType::Manager),
    );
    data.sim.lock().await.add_prosumer(Prosumer::new(
        true,
        prosumer.batteries,
        prosumer.turbines,
        1.0,
        1.,
        cell.id,
        0.,
    ));

    Ok(Json(ResponseFormat::new(format!(
        "Successfully added a node to simulation at x: {}, y: {}",
        info.x, info.y
    ))))
}

pub fn construct_service() -> actix_web::Scope {
    //TODO wrap with auth middleware

    web::scope("/grid")
        .service(get_grid)
        .service(get_item_at)
        .service(set_prosumer_at)
        .service(set_consumer_at)
        .service(set_manager_at)
}
