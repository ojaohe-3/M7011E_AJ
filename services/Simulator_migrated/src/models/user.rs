use serde::{Serialize, Deserialize};


#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Privilage{
    level: u32,
    access: Option<String>,
    id: String,
}

impl Privilage {
    pub fn new(level: u32, access: Option<String>, id: String) -> Self { Self { level, access, id } }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct  UserData{
    username: String,
    main: Option<String>,
    managers: Option<Vec<Privilage>>,
    prosumers: Option<Vec<Privilage>>,
    consumers: Option<Vec<Privilage>>,
    
}

impl UserData {
    pub fn new(username: String, main: Option<String>, managers: Option<Vec<Privilage>>, prosumers: Option<Vec<Privilage>>, consumers: Option<Vec<Privilage>>) -> Self { Self { username, main, managers, prosumers, consumers } }
}

