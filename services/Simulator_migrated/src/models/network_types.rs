use std::fmt::Display;

use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum KeyTypes {
    Source,
    Consumer,
}
impl Display for KeyTypes {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            KeyTypes::Source => write!(f, "source"),
            KeyTypes::Consumer => write!(f, "consumer"),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]

pub struct ReciveFormat {
    pub target: String,
    pub price: f64,
    pub source: String,
    pub amount: f64,
}

// impl ReciveFormat {
//     pub fn new(target: String, price: f64, source: String, amount: f64) -> Self {
//         Self {
//             target,
//             price,
//             source,
//             amount,
//         }
//     }
// }
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SendFormat {
    pub key_type: KeyTypes,
    pub amount: f64,
    pub id: String,
    pub price: Option<f64>,
    pub additional: Option<f64>,
}

impl SendFormat {
    pub fn new(
        key_type: KeyTypes,
        amount: f64,
        id: String,
        price: Option<f64>,
        additional: Option<f64>,
    ) -> Self {
        Self {
            key_type,
            amount,
            id,
            price,
            additional,
        }
    }
}