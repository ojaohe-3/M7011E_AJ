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
    db::{
        consumer_document::ConsumerDocument, grid_document::GridDocument,
        manager_document::ManagerDocument, prosumer_document::ProsumerDocument,
    },
    models::{
        consumer::{Consumer, TimeFn},
        manager::{self, Manager},
        node::{Asset, Cell, CellType, Grid},
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
    let test = data.sim.lock().await.grid.get_at(info.x, info.y).ok();
    if let Some(test) = test {
        if test.cell_type != CellType::Empty {
            return Err(WebRequestError::MemberAlreadyExist);
        }
    } else {
        return Err(WebRequestError::InvalidRange);
    }
    let cell = body.into_inner();
    let manager = cell.child;
    data.sim.lock().await.grid.set_at(
        info.x,
        info.y,
        Cell::new(cell.id.to_string(), crate::models::node::CellType::Manager),
    );

    let manager = Manager::new(
        cell.id.to_string(),
        manager.max_production,
        0.,
        0.,
        manager.price,
        false,
        manager.network,
    );
    ManagerDocument::insert(data.db.clone(), &manager)
        .await
        .ok();
    data.sim.lock().await.add_manager(manager);

    GridDocument::update(data.db.clone(), &cell.id, &data.sim.lock().await.grid)
        .await
        .ok();

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
    let test = data.sim.lock().await.grid.get_at(info.x, info.y).ok();
    if let Some(test) = test {
        if test.cell_type != CellType::Empty {
            return Err(WebRequestError::MemberAlreadyExist);
        }
    } else {
        return Err(WebRequestError::InvalidRange);
    }
    let cell = body.into_inner();
    let consumer = cell.child;
    data.sim.lock().await.grid.set_at(
        info.x,
        info.y,
        Cell::new(cell.id.to_string(), crate::models::node::CellType::Conusmer),
    );
    let consumer = Consumer::new(
        consumer.timefn,
        consumer.profile,
        consumer.asset,
        consumer.id,
        consumer.network,
    );
    GridDocument::update(data.db.clone(), &cell.id, &data.sim.lock().await.grid)
        .await
        .ok();
    ConsumerDocument::insert(data.db.clone(), &consumer)
        .await
        .ok();
    data.sim.lock().await.add_consumer(consumer);

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
    let test = data.sim.lock().await.grid.get_at(info.x, info.y).ok();
    if let Some(test) = test {
        if test.cell_type != CellType::Empty {
            return Err(WebRequestError::MemberAlreadyExist);
        }
    } else {
        return Err(WebRequestError::InvalidRange);
    }
    let cell = body.into_inner();
    let prosumer = cell.child;
    data.sim.lock().await.grid.set_at(
        info.x,
        info.y,
        Cell::new(cell.id.to_string(), crate::models::node::CellType::Prosumer),
    );
    let prosumer = Prosumer::new(
        true,
        prosumer.batteries,
        prosumer.turbines,
        1.0,
        1.,
        cell.id.to_string(),
        0.,
        prosumer.network,
    );
    ProsumerDocument::insert(data.db.clone(), &prosumer)
        .await
        .ok();
    data.sim.lock().await.add_prosumer(prosumer);
    GridDocument::update(data.db.clone(), &cell.id, &data.sim.lock().await.grid)
        .await
        .ok();
    Ok(Json(ResponseFormat::new(format!(
        "Successfully added a node to simulation at x: {}, y: {}",
        info.x, info.y
    ))))
}

pub fn construct_service() -> actix_web::Scope {
    //TODO: wrap with auth middleware
    web::scope("/grid")
        .service(get_grid)
        .service(get_item_at)
        .service(set_prosumer_at)
        .service(set_consumer_at)
        .service(set_manager_at)
}
