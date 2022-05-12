use actix_web::{guard::Guard, http::header};
use serde::{Deserialize, Serialize};

use crate::{
    api::formats::WebRequestError,
    models::user::{Privilage, UserData},
};

pub struct Authentication;
#[derive(Debug, Clone, Serialize, Deserialize)]
struct VerificationStruct {
    message: String,
    status: u32,
    body: Option<UserData>,
    reason: Option<String>,
}
impl Authentication {
    pub async fn verify_token(token: String) -> Result<Option<UserData>, reqwest::Error> {
        let url = format!("{}/api/validate", dotenv::var("AUTH_ENDPOINT").unwrap());
        let client = reqwest::Client::new();
        let res = client.get(url).bearer_auth(token).send().await?;
        let raw: VerificationStruct = res.json().await.unwrap();

        return Ok(raw.body);
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

    pub async fn claims(token: String, guarded: Privilage) -> Result<(), WebRequestError> {
        if let Some(claimant) = match Authentication::verify_token(token).await {
            Ok(v) => v,
            Err(e) => return Err(WebRequestError::from(e)),
        } {
            if claimant.admin {
                return Ok(());
            }

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
