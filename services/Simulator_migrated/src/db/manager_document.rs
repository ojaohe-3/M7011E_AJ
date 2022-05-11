use mongodb::{bson::{self, doc}, Database, options::UpdateOptions, results};

use crate::models::manager::Manager;

pub struct ManagerDocument;

impl ManagerDocument {
    pub async fn insert(
        db: Database,
        item: &Manager,
    ) -> Result<results::InsertOneResult, mongodb::error::Error> {

        db.collection::<Manager>("managers")
            .insert_one(item, None)
            .await
    }

    pub async fn get(db: Database, id: &String) -> Result<Option<Manager>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        db.collection::<Manager>("managers")
            .find_one(query, None)
            .await
    }

    pub async fn update(
        db: Database,
        id: &String,
        item: &Manager,
    ) -> Result<results::UpdateResult, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        let current = item.current.to_string();
        let max_producion = item.max_production.to_string();
        let price = item.price.to_string();
        let ratio = item.ratio.to_string();
        let status = item.status.to_string();

        let update = doc! {
            "$set" : { 
                "status": status,
                "max_producion": max_producion,
                "price":  price,
                "ratio": ratio,
                "current": current,
                "network": item.network.to_string(),
            }
        };

        let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Manager>("prosumers")
            .update_one(query, update.to_owned(), options)
            .await
    }
}