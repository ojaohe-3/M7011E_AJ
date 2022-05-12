use mongodb::{bson::{doc, self}, Database, results, options::UpdateOptions};

use crate::models::consumer::Consumer;




pub struct ConsumerDocument;

impl ConsumerDocument {
    pub async fn insert(
        db: Database,
        item: &Consumer,
    ) -> Result<results::InsertOneResult, mongodb::error::Error> {

        db.collection::<Consumer>("consumers")
            .insert_one(item, None)
            .await
    }
    
    pub async fn get(db: Database, id: &String) -> Result<Option<Consumer>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        db.collection::<Consumer>("consumers")
            .find_one(query, None)
            .await
    }

    pub(crate) async fn update(db: Database, id: String, item: &Consumer) -> Result<results::UpdateResult, mongodb::error::Error> {

        let query = doc! {
            "id": id
        };

        let demand = bson::to_bson(&item.demand).unwrap();
        let profile = bson::to_bson(&item.profile).unwrap();
        let timefn = bson::to_bson(&item.timefn).unwrap();
        let network = item.network.to_string();
        let update = doc! {
            "$set" : { 
                "demand": demand,
                "profile": profile,
                "timefn":  timefn,
                "network": network,
            }
        };

        let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Consumer>("consumers")
            .update_one(query, update.to_owned(), options)
            .await
    }
    
}

