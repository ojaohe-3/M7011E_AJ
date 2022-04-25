use actix_web::{
    get, post, put,
    web::{self, Json, Path},
};
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::{ResponseFormat, WebRequestError},
    handlers::simulation_handler::simulation_singleton,
    models::manager::{self, Manager},
};

#[derive(Clone, Debug, Serialize, Deserialize)]
struct MemberInfo {
    id: Option<String>,
    max_production: f64, // in kw
    price: f64,          // price in kr
}

#[get("/")]
pub async fn get_all() -> Json<Vec<Manager>> {
    let sim = simulation_singleton();
    let managers = sim.inner.lock().unwrap().managers.to_vec();
    Json(managers)
}

#[post("/")]
pub async fn generate_member(
    body: Json<MemberInfo>,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let sim = simulation_singleton();
    let manager = body.into_inner();
    if let Some(id) = manager.id {
        if sim.inner.lock().unwrap().get_manager(&id).is_some() {
            return Err(WebRequestError::MemberAlreadyExist);
        } else {
            sim.inner.lock().unwrap().add_manager(Manager::new(
                id,
                manager.max_production,
                0.0,
                0.,
                manager.price,
                false,
            ));
        }
    } else {
        let id = uuid::Uuid::new_v4().to_string();
        sim.inner.lock().unwrap().add_manager(Manager::new(
            id,
            manager.max_production,
            0.0,
            0.,
            manager.price,
            false,
        ));
    }
    return Ok(Json(ResponseFormat::new(format!("Success!"))));
}

#[get("/{id}")]
pub async fn get_member(id: Path<String>) -> Result<Json<Manager>, WebRequestError> {
    let sim = simulation_singleton();
    let manager = sim.inner.lock().unwrap().get_manager(&id).cloned();
    match manager {
        Some(m) => return Ok(Json(m)),
        None => return Err(WebRequestError::MemberNotFound),
    }
}

#[put("/{id}")]
pub async fn update_member(
    id: Path<String>,
    body: Json<MemberInfo>,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let sim = simulation_singleton();
    let member = body.into_inner();
    let response = sim
        .inner
        .lock()
        .unwrap()
        .get_manager_mut(&id)
        .and_then(|m| {
            m.price = member.price;
            m.max_production = member.max_production;
            Some(ResponseFormat::new("Success!".to_string()))
        });
    match response {
        Some(res) => return Ok(Json(res)),
        None => return Err(WebRequestError::MemberNotFound),
    }
}

pub fn construct_service() -> actix_web::Scope {
    //TODO wrap with auth middleware

    web::scope("/managers")
        .service(get_all)
        .service(update_member)
        .service(get_member)
        .service(generate_member)
}
