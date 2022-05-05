use actix_web::{
    get, put,
    web::{self, Json, Path}, post,
};
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::{WebRequestError, ResponseFormat}, app::AppState,
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
async fn get_ratio(path: Path<MemberInfo>, data:  web::Data<AppState>) -> actix_web::Result<Json<MemberData>, WebRequestError> {
    let id = &path.id;

    let response = data.sim
        .lock()
        .await
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
    data:  web::Data<AppState>,
) -> actix_web::Result<Json<ResponseFormat>, WebRequestError> {
    let id = &path.id;
    let ratio = body.ratio;
    let response = data.sim
        .lock()
        .await
        .get_manager_mut(&id)
        .and_then(|m| {
            m.ratio = ratio;
            Some(ResponseFormat {
                message: "Success".to_string(),
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
    data:  web::Data<AppState>,

) -> actix_web::Result<Json<ResponseFormat>, WebRequestError> {
    let (id, status) = path.into_inner();
    let response = data.sim
        .lock()
        .await
        .get_manager_mut(&id)
        .and_then(|m| {
            m.status = status;
            Some(ResponseFormat {
                message: "Success".to_string(),
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
