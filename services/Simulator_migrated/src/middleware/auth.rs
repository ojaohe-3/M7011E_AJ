use std::time::Duration;

use serde::{Deserialize, Serialize};

use crate::{
    api::formats::WebRequestError,
    models::user::{Privilege, UserData},
};

pub struct Authentication;
#[derive(Debug, Clone, Serialize, Deserialize)]
struct VerificationStruct {
    message: String,
    status: u32,
    body: Option<NestedBody>,
    reason: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
struct NestedBody {
    data: UserData,
    iat: Option<u64>,
    exp: Option<u64>,
}

// pub(crate) async fn validator(req: ServiceRequest, credentials: BearerAuth) -> Result<ServiceRequest, actix_web::Error> {
//     let config = req
//         .app_data::<Config>()
//         .map(|data| data.clone())
//         .unwrap_or_else(Default::default);
//     match Authentication::verify_token(credentials.token().to_string()).await {
//         Ok(_) => Ok(req),
//         Err(e) => Err(AuthenticationError::from(config).into()),
//     }
// }
impl Authentication {
    pub async fn verify_token(token: String) -> Result<Option<UserData>, reqwest::Error> {
        let url = format!("{}/api/validate", dotenv::var("AUTH_ENDPOINT").unwrap());
        let client = reqwest::ClientBuilder::new()
            .danger_accept_invalid_certs(true) // FIXME: temp until tls fix for reqwests is found
            .connect_timeout(Duration::from_secs_f64(3.0))
            .build()
            .unwrap();
        let res = client.get(url).bearer_auth(token).send().await?;
        // let text = res.text().await?;
        // println!("response was: {}", text);
        let raw: VerificationStruct = res.json().await?;
        if raw.status == 1 {
            return Ok(Some(raw.body.unwrap().data));
        }
        Ok(None)
    }
    pub async fn is_admin(token: String) -> Result<(), WebRequestError> {
        let user = match Authentication::verify_token(token).await {
            Ok(v) => v,
            Err(e) => return Err(WebRequestError::from(e)),
        };
        if let Some(user) = user {
            if user.admin {
                return Ok(());
            }
        }

        Err(WebRequestError::NotAuthorized)
    }

    pub async fn claims(token: String, guarded: Privilege) -> Result<(), WebRequestError> {
        let claimant = match Authentication::verify_token(token).await {
            Ok(v) => v,
            Err(e) => return Err(WebRequestError::from(e)),
        };
        if let Some(claimant) = claimant {
            if claimant.admin {
                return Ok(());
            }
            // TODO: access field

            if let Some(conumers) = claimant.consumers {
                for c in conumers {
                    if c.id.eq(&guarded.id) {
                        if c.level >= guarded.level {
                            return Ok(());
                        } else {
                            return Err(WebRequestError::TooLowClearance(c.level, guarded.level));
                        }
                    }
                }
            }

            if let Some(prosumers) = claimant.prosumers {
                for p in prosumers {
                    if p.id.eq(&guarded.id) {
                        if p.level >= guarded.level {
                            return Ok(());
                        } else {
                            return Err(WebRequestError::TooLowClearance(p.level, guarded.level));
                        }
                    }
                }
            }

            if let Some(managers) = claimant.managers {
                for m in managers {
                    if m.id.eq(&guarded.id) {
                        if m.level >= guarded.level {
                            return Ok(());
                        } else {
                            return Err(WebRequestError::TooLowClearance(m.level, guarded.level));
                        }
                    }
                }
            }
        }
        Err(WebRequestError::NotAuthorized)
    }
}
