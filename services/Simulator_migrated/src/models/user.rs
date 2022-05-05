use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Privilage {
    pub level: u32,
    pub access: Option<String>, // TODO: this is currently unused, but it is intended to point inherit other users access level for a specific item
    pub id: String,
}

impl Privilage {
    pub fn new(level: u32, access: Option<String>, id: String) -> Self {
        Self { level, access, id }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserData {
    pub id: String,
    pub username: String,
    pub main: Option<String>,
    pub managers: Option<Vec<Privilage>>,
    pub prosumers: Option<Vec<Privilage>>,
    pub consumers: Option<Vec<Privilage>>,
    pub admin: bool,
}

impl UserData {
    pub fn new(
        id: String,
        username: String,
        main: Option<String>,
        managers: Option<Vec<Privilage>>,
        prosumers: Option<Vec<Privilage>>,
        consumers: Option<Vec<Privilage>>,
    ) -> Self {
        Self {
            id,
            username,
            main,
            managers,
            prosumers,
            consumers,
            admin: false,
        }
    }
}
