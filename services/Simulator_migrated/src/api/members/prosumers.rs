use actix_web::{
    get, post, put,
    web::{self, Json, Path},
};
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::{ResponseFormat, WebRequestError},
    app::AppState,
    models::prosumer::{Battery, Prosumer, Turbine},
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateProsumerInfo {
    id: Option<String>,
    pub turbines: Vec<Turbine>,
    pub batteries: Vec<Battery>,
}

#[get("/")]
pub async fn get_all(data: web::Data<AppState>) -> Json<Vec<Prosumer>> {
    let prosumers = data.sim.lock().await.prosumers.to_vec();
    Json(prosumers)
}

#[post("/")]
pub async fn generate_member(
    body: Json<CreateProsumerInfo>,
    data: web::Data<AppState>,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let prosumer = body.into_inner();
    if let Some(id) = prosumer.id {
        if data.sim.lock().await.get_prosumer(&id).is_some() {
            return Err(WebRequestError::MemberAlreadyExist);
        } else {
            data.sim.lock().await.add_prosumer(Prosumer::new(
                true,
                prosumer.batteries,
                prosumer.turbines,
                1.,
                1.,
                id,
                0.,
            ));
        }
    } else {
        let id = uuid::Uuid::new_v4().to_string();
        data.sim.lock().await.add_prosumer(Prosumer::new(
            true,
            prosumer.batteries,
            prosumer.turbines,
            1.,
            1.,
            id,
            0.,
        ));
    }
    return Ok(Json(ResponseFormat::new(format!("Success!"))));
}

#[get("/{id}")]
pub async fn get_member(
    id: Path<String>,
    data: web::Data<AppState>,
) -> Result<Json<Prosumer>, WebRequestError> {
    let prsoumer = data.sim.lock().await.get_prosumer(&id).cloned();
    match prsoumer {
        Some(m) => return Ok(Json(m)),
        None => return Err(WebRequestError::MemberNotFound),
    }
}

#[put("/{id}")]
pub async fn update_member(
    id: Path<String>,
    body: Json<CreateProsumerInfo>,
    data: web::Data<AppState>,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let member = body.into_inner();
    let response = data
        .sim
        .lock()
        .await
        .get_prosumer_mut(&id)
        .and_then(|m| Some(ResponseFormat::new("Success!".to_string())));
    match response {
        Some(res) => return Ok(Json(res)),
        None => return Err(WebRequestError::MemberNotFound),
    }
}

pub fn construct_service() -> actix_web::Scope {
    //TODO wrap with auth middleware

    web::scope("/prosumers")
        .service(get_all)
        .service(update_member)
        .service(get_member)
        .service(generate_member)
}
