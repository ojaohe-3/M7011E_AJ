use actix_web::{
    get, post, put,
    web::{self, Json, Path},
};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::{ResponseFormat, WebRequestError},
    app::AppState,
    middleware::auth::Authentication,
    models::{consumer::Consumer, node::Asset, user::Privilege},
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateConsumerInfo {
    pub id: Option<String>,
    pub profile: Option<f64>,
    pub timefn: Option<[f64; 24]>,
    pub asset: Option<Asset>,
    pub network: String,
}

#[get("/")]
pub async fn get_all(data: web::Data<AppState>) -> Json<Vec<Consumer>> {
    let consumers = data.sim.lock().await.consumers.to_vec();
    Json(consumers)
}

#[post("/")]
pub async fn generate_member(
    body: Json<CreateConsumerInfo>,
    data: web::Data<AppState>,
    auth: BearerAuth,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    Authentication::is_admin(auth.token().to_string()).await?;

    let consumer = body.into_inner();
    if let Some(id) = &consumer.id {
        if data.sim.lock().await.get_consumer(id).is_some() {
            return Err(WebRequestError::MemberAlreadyExist);
        }
    }
    data.sim.lock().await.add_consumer(Consumer::new(
        consumer.timefn,
        consumer.profile,
        consumer.asset,
        consumer.id,
        consumer.network,
    ));

    return Ok(Json(ResponseFormat::new(format!("Success!"))));
}

#[get("/{id}")]
pub async fn get_member(
    id: Path<String>,
    data: web::Data<AppState>,
    auth: BearerAuth,
) -> Result<Json<Consumer>, WebRequestError> {
    Authentication::claims(
        auth.token().to_string(),
        Privilege::new(
            1,
            Some(format!("view")),
            id.to_string(),
            "Consumer".to_string(),
        ),
    )
    .await?;
    let consumer = data.sim.lock().await.get_consumer(&id).cloned();
    match consumer {
        Some(m) => return Ok(Json(m)),
        None => return Err(WebRequestError::MemberNotFound),
    }
}

#[put("/{id}")]
pub async fn update_member(
    id: Path<String>,
    body: Json<CreateConsumerInfo>,
    data: web::Data<AppState>,
    auth: BearerAuth,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    Authentication::claims(
        auth.token().to_string(),
        Privilege::new(
            5,
            Some(format!("modify")),
            id.to_string(),
            "Consumer".to_string(),
        ),
    )
    .await?;

    let member = body.into_inner();
    let response = data.sim.lock().await.get_consumer_mut(&id).and_then(|m| {
        if let Some(p) = member.profile {
            m.profile = p;
        }
        if let Some(a) = member.asset {
            m.asset = a;
        }
        if let Some(tf) = member.timefn {
            m.timefn = tf;
        }
        Some(ResponseFormat::new("Success!".to_string()))
    });
    match response {
        Some(res) => return Ok(Json(res)),
        None => return Err(WebRequestError::MemberNotFound),
    }
}

pub fn construct_service() -> actix_web::Scope {
    //TODO wrap with auth middleware

    web::scope("/consumers")
        .service(get_all)
        .service(update_member)
        .service(get_member)
        .service(generate_member)
}
