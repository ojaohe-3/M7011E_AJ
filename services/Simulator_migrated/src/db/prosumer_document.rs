use mongodb::{
    bson::{self, doc},
    options::UpdateOptions,
    results, Database,
};

use crate::models::{node::Grid, prosumer::Prosumer};

pub struct ProsumerDocument;

impl ProsumerDocument {
    pub async fn insert(
        db: Database,
        item: &Prosumer,
    ) -> Result<results::InsertOneResult, mongodb::error::Error> {
        // let query = doc! {
        //     "id": &item.id
        // };
        // let bson_item = bson::to_bson(&item)?;
        // let document = bson_item.as_document().unwrap();
        // let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Prosumer>("prosumers")
            .insert_one(item.to_owned(), None)
            .await
    }

    pub async fn update(
        db: Database,
        id: &String,
        item: &Prosumer,
    ) -> Result<results::UpdateResult, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };

        let status = bson::to_bson(&item.status).unwrap();
        let batteries = bson::to_bson(&item.batteries).unwrap();
        let turbines = bson::to_bson(&item.turbines).unwrap();
        let input_ratio = bson::to_bson(&item.input_ratio).unwrap();
        let network = &item.network;
        let output_ratio = bson::to_bson(&item.output_ratio).unwrap();
        let demand = bson::to_bson(&item.demand).unwrap();
        let total_stored = bson::to_bson(&item.total_stored).unwrap();
        let update = doc! {
            "$set" : { 
                "status": status,
                "batteries": batteries,
                "turbines":  turbines,
                "input_ratio": input_ratio,
                "output_ratio": output_ratio,
                "network": network,
                "total_stored": total_stored,
                "demand": demand,
            }
        };

        let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Prosumer>("prosumers")
            .update_one(query, update.to_owned(), options)
            .await
    }

    pub async fn get(db: Database, id: &String) -> Result<Option<Prosumer>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        db.collection::<Prosumer>("prosumers")
            .find_one(query, None)
            .await
    }
}
