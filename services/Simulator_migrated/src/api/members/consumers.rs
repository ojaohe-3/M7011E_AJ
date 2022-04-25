use actix_web::{
    get, post, put,
    web::{self, Json, Path},
};
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::{ResponseFormat, WebRequestError},
    handlers::simulation_handler::simulation_singleton,
    models::{consumer::Consumer, node::Asset},
};

#[derive(Clone, Debug, Serialize, Deserialize)]
struct MemberInfo {
    id: Option<String>,
    profile: Option<f64>,
    timefn: Option<[f64; 24]>,
    asset: Option<Asset>,
}

#[get("/")]
pub async fn get_all() -> Json<Vec<Consumer>> {
    let sim = simulation_singleton();
    let consumers = sim.inner.lock().unwrap().consumers.to_vec();
    Json(consumers)
}

#[post("/")]
pub async fn generate_member(
    body: Json<MemberInfo>,
) -> Result<Json<ResponseFormat>, WebRequestError> {
    let sim = simulation_singleton();
    let consumer = body.into_inner();
    if let Some(id) = consumer.id {
        if sim.inner.lock().unwrap().get_consumer(&id).is_some() {
            return Err(WebRequestError::MemberAlreadyExist);
        }
    }
    sim.inner.lock().unwrap().add_consumer(Consumer::new(
        if let Some(tf) = consumer.timefn {
            tf
        } else {
            Consumer::generate_time_fn()
        },
        consumer.profile,
        consumer.asset,
        consumer.id,
    ));

    return Ok(Json(ResponseFormat::new(format!("Success!"))));
}

#[get("/{id}")]
pub async fn get_member(id: Path<String>) -> Result<Json<Consumer>, WebRequestError> {
    let sim = simulation_singleton();
    let consumer = sim.inner.lock().unwrap().get_consumer(&id).cloned();
    match consumer {
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
        .get_consumer_mut(&id)
        .and_then(|m| {
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
        // .service(get_member)
        .service(generate_member)
}
