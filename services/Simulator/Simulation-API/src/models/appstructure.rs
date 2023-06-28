use serde::{Deserialize, Serialize};


#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct AppStructure{
    pub id: String,
    pub name: String,
    pub grid: String,
}

