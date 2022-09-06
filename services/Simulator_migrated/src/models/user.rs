use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Privilage {
    pub level: u32,
    ///  This is currently unused, but it is intended let user 
    ///  to add members to a resource that although have lower
    ///  clearance have the option of having access to specific things and services.
    pub access: Option<String>, 
    pub id: String,
    pub _type: String,
}

impl Privilage {
    pub fn new(level: u32, access: Option<String>, id: String, _type: String) -> Self {
        Self { level, access, id, _type: _type }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserData {
    pub _id: Option<String>,
    pub id: Option<String>,
    pub username: String,
    pub main: Option<String>,
    pub managers: Option<Vec<Privilage>>,
    pub prosumers: Option<Vec<Privilage>>,
    pub consumers: Option<Vec<Privilage>>,
    pub admin: bool,
    pub last_login: Option<String>
}

// impl UserData {
//     pub fn new(
//         id: String,
//         username: String,
//         main: Option<String>,
//         managers: Option<Vec<Privilage>>,
//         prosumers: Option<Vec<Privilage>>,
//         consumers: Option<Vec<Privilage>>,
//     ) -> Self {
//         Self {
//             id,
//             username,
//             main,
//             managers,
//             prosumers,
//             consumers,
//             admin: false,
//         }
//     }
// }
