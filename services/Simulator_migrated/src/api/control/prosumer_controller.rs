use actix_web::{
    get, post, put,
    web::{self, Json, Path},
};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::{ResponseFormat, WebRequestError},
    app::AppState, middleware::auth::Authentication, models::user::Privilage,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct MemberInfo {
    id: String,
}
#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
struct MemberData {
    input_ratio: f64,
    output_ratio: f64,
}

#[get("/{id}")]

async fn get_ratio(
    path: Path<MemberInfo>,
    data: web::Data<AppState>,
    auth: BearerAuth
) -> actix_web::Result<Json<MemberData>, WebRequestError> {
    let id = &path.id;
    Authentication::claims(auth.token().to_string(), Privilage::new(1, Some(format!("view;control")), id.to_string())).await?;

    let response = data.sim.lock().await.get_prosumer_mut(&id).and_then(|p| {
        Some(MemberData {
            input_ratio: p.input_ratio,
            output_ratio: p.output_ratio,
        })
    });

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
    auth: BearerAuth
) -> actix_web::Result<Json<ResponseFormat>, WebRequestError> {
    
    let id = &path.id;
    Authentication::claims(auth.token().to_string(), Privilage::new(3, Some(format!("modify;control")), id.to_string())).await?;
    let ratio = body.into_inner();
    let response = data.sim.lock().await.get_prosumer_mut(&id).and_then(|p| {
        p.input_ratio = ratio.input_ratio;
        p.output_ratio = ratio.output_ratio;
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
    data: web::Data<AppState>,
    auth: BearerAuth
) -> actix_web::Result<Json<ResponseFormat>, WebRequestError> {
    let (id, status) = path.into_inner();
    Authentication::claims(auth.token().to_string(), Privilage::new(2, Some(format!("enable;control")), id.to_string())).await?;

    let response = data.sim.lock().await.get_prosumer_mut(&id).and_then(|m| {
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

#[post("/{id}/{duration}")]
async fn pause(
    path: Path<(String, f64)>,
    data: web::Data<AppState>,
    auth: BearerAuth
) -> actix_web::Result<Json<ResponseFormat>, WebRequestError> {
    let (id, duration) = path.into_inner();
    Authentication::claims(auth.token().to_string(), Privilage::new(2, Some(format!("enable;control")), id.to_string())).await?;

    let response = data.sim.lock().await.get_prosumer_mut(&id).and_then(|p| {
        p.status = false;
        p.timeout = duration.clamp(0., 3600.); // max time out is an hour and minimum is 0
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

    web::scope("/prosumer")
        .service(set_ratio)
        .service(get_ratio)
        .service(set_active)
        .service(pause)
}
