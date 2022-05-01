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
    handlers::simulation_handler::simulation_singleton,
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
pub async fn get_grid() -> Json<Grid> {
    let grid = simulation_singleton().inner.lock().await.grid.clone();
    Json(grid)
}
#[get("/{x}/{y}")]
pub async fn get_item_at(path: Path<PathInfo>) -> Result<Json<Cell>, WebRequestError> {
    let info = path.into_inner();
    let data = simulation_singleton()
        .inner
        .lock()
        .await
        .grid
        .get_at(info.x, info.y);
    match data {
        Err(_) => Err(WebRequestError::InvalidRange),
        Ok(v) => Ok(Json(v)),
    }
}

#[post("/{x}/{y}/manager")]
pub async fn set_manager_at(
    path: Path<PathInfo>,
    body: Json<CreateMemeberInfo<CreateManagerInfo>>,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let info = path.into_inner();
    let cell = body.into_inner();
    let manager = cell.child;
    simulation_singleton().inner.lock().await.grid.set_at(
        info.x,
        info.y,
        Cell::new(
            cell.id.to_string(),
            crate::models::node::CellType::Manager,
        ),
    );
    simulation_singleton()
        .inner
        .lock()
        .await
        .add_manager(Manager::new(
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
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let info = path.into_inner();
    let cell = body.into_inner();
    let consumer = cell.child;
    simulation_singleton().inner.lock().await.grid.set_at(
        info.x,
        info.y,
        Cell::new(
            cell.id.to_string(),
            crate::models::node::CellType::Manager,
        ),
    );
    simulation_singleton()
        .inner
        .lock()
        .await
        .add_consumer(Consumer::new(
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
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let info = path.into_inner();
    let cell = body.into_inner();
    let prosumer = cell.child;
    simulation_singleton().inner.lock().await.grid.set_at(
        info.x,
        info.y,
        Cell::new(
            cell.id.to_string(),
            crate::models::node::CellType::Manager,
        ),
    );
    simulation_singleton()
        .inner
        .lock()
        .await
        .add_prosumer(Prosumer::new(
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
