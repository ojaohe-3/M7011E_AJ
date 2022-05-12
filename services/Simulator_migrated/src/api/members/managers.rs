use actix_web::{
    get, post, put,
    web::{self, Json, Path},
};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::{ResponseFormat, WebRequestError},
    app::AppState,
    models::{manager::{self, Manager}, user::Privilage}, middleware::auth::Authentication,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateManagerInfo {
    id: Option<String>,
    pub max_production: f64, // in kw
    pub price: f64,          // price in kr
    pub network: String
}

#[get("/")]
pub async fn get_all(data: web::Data<AppState>) -> Json<Vec<Manager>> {
    let managers = data.sim.lock().await.managers.to_vec();
    Json(managers)
}

#[post("/")]
pub async fn generate_member(
    body: Json<CreateManagerInfo>,
    data: web::Data<AppState>,
    auth: BearerAuth
) -> Result<Json<ResponseFormat>, WebRequestError> {
    Authentication::is_admin(auth.token().to_string()).await?;
    let manager = body.into_inner();
    if let Some(id) = manager.id {
        if data.sim.lock().await.get_manager(&id).is_some() {
            return Err(WebRequestError::MemberAlreadyExist);
        } else {
            data.sim.lock().await.add_manager(Manager::new(
                id,
                manager.max_production,
                0.0,
                0.,
                manager.price,
                false,
                manager.network
            ));
        }
    } else {
        let id = uuid::Uuid::new_v4().to_string();
        data.sim.lock().await.add_manager(Manager::new(
            id,
            manager.max_production,
            0.0,
            0.,
            manager.price,
            false,
            manager.network

        ));
    }
    return Ok(Json(ResponseFormat::new(format!("Success!"))));
}

#[get("/{id}")]
pub async fn get_member(
    id: Path<String>,
    data: web::Data<AppState>,
    auth: BearerAuth
) -> Result<Json<Manager>, WebRequestError> {
    Authentication::claims(auth.token().to_string(), Privilage::new(3, Some(format!("view")), id.to_string())).await?;
    let manager = data.sim.lock().await.get_manager(&id).cloned();
    match manager {
        Some(m) => return Ok(Json(m)),
        None => return Err(WebRequestError::MemberNotFound),
    }
}

#[put("/{id}")]
pub async fn update_member(
    id: Path<String>,
    body: Json<CreateManagerInfo>,
    data: web::Data<AppState>,
    auth: BearerAuth
) -> Result<Json<ResponseFormat>, WebRequestError> {
    Authentication::claims(auth.token().to_string(), Privilage::new(5, Some(format!("modify")), id.to_string())).await?;
    let member = body.into_inner();
    let response = data.sim.lock().await.get_manager_mut(&id).and_then(|m| {
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
