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

    pub fn claims(claimant: UserData, guarded: Privilage) -> Result<(), WebRequestError> {
        if (claimant.admin) {
            return Ok(());
        }

        if let Some(conumers) = claimant.consumers {
            for c in conumers {
                if (c.id.eq(&guarded.id) && c.level >= guarded.level) {
                    return Ok(());
                }
            }
        }

        if let Some(prosumers) = claimant.prosumers {
            for p in prosumers {
                if (p.id.eq(&guarded.id) && p.level >= guarded.level) {
                    return Ok(());
                }
            }
        }

        if let Some(managers) = claimant.managers {
            for m in managers {
                if (m.id.eq(&guarded.id) && m.level >= guarded.level) {
                    return Ok(());
                }
            }
        }

        Err(WebRequestError::NotAuthorized)
    }
}
