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
        let current = bson::to_bson(&item.current).unwrap();
        let max_producion = bson::to_bson(&item.max_production).unwrap();
        let price = bson::to_bson(&item.price).unwrap();
        let ratio = bson::to_bson(&item.ratio).unwrap();
        let status = bson::to_bson(&item.status).unwrap();

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