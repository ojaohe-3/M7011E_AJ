use actix_web::{
    get, post, put,
    web::{self, Json, Path},
};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::{ResponseFormat, WebRequestError},
    app::AppState,
    models::{prosumer::{Battery, Prosumer, Turbine}, user::Privilage}, middleware::auth::Authentication,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateProsumerInfo {
    id: Option<String>,
    pub turbines: Vec<Turbine>,
    pub batteries: Vec<Battery>,
    pub network: String,
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
    auth: BearerAuth
) -> Result<Json<ResponseFormat>, WebRequestError> {
    Authentication::is_admin(auth.token().to_string()).await?;
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
                format!("")
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
            prosumer.network
        ));
    }
    return Ok(Json(ResponseFormat::new(format!("Success!"))));
}

#[get("/{id}")]
pub async fn get_member(
    id: Path<String>,
    data: web::Data<AppState>,
    auth: BearerAuth
) -> Result<Json<Prosumer>, WebRequestError> {
    Authentication::claims(auth.token().to_string(), Privilage::new(3, Some(format!("view")), id.to_string())).await?;
    let prosumer = data.sim.lock().await.get_prosumer(&id).cloned();
    match prosumer {
        Some(m) => return Ok(Json(m)),
        None => return Err(WebRequestError::MemberNotFound),
    }
}

#[put("/{id}")]
pub async fn update_member(
    id: Path<String>,
    body: Json<CreateProsumerInfo>,
    data: web::Data<AppState>,
    auth: BearerAuth
) -> Result<Json<ResponseFormat>, WebRequestError> {
    Authentication::claims(auth.token().to_string(), Privilage::new(5, Some(format!("modify")), id.to_string())).await?;
    let member = body.into_inner();
    let response = data
        .sim
        .lock()
        .await
        .get_prosumer_mut(&id)
        .and_then(|m: &mut Prosumer| {
            m.batteries=member.batteries;
            m.turbines=member.turbines;
            return Some(ResponseFormat::new("Success!".to_string()));
        });
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
