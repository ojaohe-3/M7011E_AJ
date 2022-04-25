use actix_web::{
    get, put,
    web::{self, Json, Path}, post,
};
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::{WebRequestError, ResponseFormat},
    handlers::simulation_handler::simulation_singleton,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct MemberInfo {
    id: String,
}
#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
struct MemberData {
    ratio: f64,
}

#[get("/{id}")]
async fn get_ratio(path: Path<MemberInfo>) -> actix_web::Result<Json<MemberData>, WebRequestError> {
    let id = &path.id;

    let sim = simulation_singleton();
    let response = sim
        .inner
        .lock()
        .unwrap()
        .get_manager(&id)
        .and_then(|m| Some(MemberData { ratio: m.ratio }));

    if let Some(res) = response {
        return Ok(Json(res));
    } else {
        return Err(WebRequestError::MemberNotFound);
    }
}
#[put("/{id}")]
async fn set_ratio(
    path: Path<MemberInfo>,
    body: Json<MemberData>,
) -> actix_web::Result<Json<ResponseFormat>, WebRequestError> {
    let id = &path.id;
    let ratio = body.ratio;
    let sim = simulation_singleton();
    let response = sim
        .inner
        .lock()
        .unwrap()
        .get_manager_mut(&id)
        .and_then(|m| {
            m.ratio = ratio;
            Some(ResponseFormat {
                message: "Successed".to_string(),
                code: 200,
            })
        });
    if let Some(res) = response {
        return Ok(Json(res));
    } else {
        return Err(WebRequestError::MemberNotFound);
    }
}


#[post("/{id}/{status}")]
async fn set_active(
    path: Path<(String, bool)>,
) -> actix_web::Result<Json<ResponseFormat>, WebRequestError> {
    let (id, status) = path.into_inner();
    let sim = simulation_singleton();
    let response = sim
        .inner
        .lock()
        .unwrap()
        .get_manager_mut(&id)
        .and_then(|m| {
            m.status = status;
            Some(ResponseFormat {
                message: "Successed".to_string(),
                code: 200,
            })
        });
    if let Some(res) = response {
        return Ok(Json(res));
    } else {
        return Err(WebRequestError::MemberNotFound);
    }
}

pub fn construct_service() -> actix_web::Scope {
    //TODO wrap with auth middleware

    web::scope("/manager").service(set_ratio).service(get_ratio).service(set_active)
}
