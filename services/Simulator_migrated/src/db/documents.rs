// use actix_web::error::InternalError;

use mongodb::{
    bson::{self, doc},
    options::UpdateOptions,
    results, Database,
};

use crate::models::{node::Grid, prosumer::Prosumer, consumer::Consumer, manager::Manager};

pub struct AppDocument;

// impl AppDocument {
//     pub async fn insert(
//         db: Database,
//         item: ,
//     ) -> Result<results::UpdateResult, mongodb::error::Error> {
//         let query = doc! {
//             "id": &item.id
//         };
//         let bson_item = bson::to_bson(&item)?;
//         let document = bson_item.as_document().unwrap();
//         let options = UpdateOptions::builder().upsert(true).build();
//         db.collection::<Grid>("grids")
//             .update_one(query, document.to_owned(), options)
//             .await
//     }

//     pub async fn get(db: Database, id: &String) -> Result<Option<Grid>, mongodb::error::Error> {
//         let query = doc! {
//             "id": id
//         };
//         db.collection::<Grid>("grids").find_one(query, None).await
//     }
// }

pub struct GridDocument;

impl GridDocument {
    pub async fn insert(
        db: Database,
        item: Grid,
    ) -> Result<results::UpdateResult, mongodb::error::Error> {
        let query = doc! {
            "id": &item.id
        };
        let bson_item = bson::to_bson(&item)?;
        let document = bson_item.as_document().unwrap();
        let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Grid>("grids")
            .update_one(query, document.to_owned(), options)
            .await
    }

    pub async fn get(db: Database, id: &String) -> Result<Option<Grid>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        db.collection::<Grid>("grids").find_one(query, None).await
    }
}
pub struct ProsumerDocument;

impl ProsumerDocument {
    pub async fn insert(
        db: Database,
        item: Prosumer,
    ) -> Result<results::UpdateResult, mongodb::error::Error> {
        let query = doc! {
            "id": &item.id
        };
        let bson_item = bson::to_bson(&item)?;
        let document = bson_item.as_document().unwrap();
        let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Prosumer>("prosumers")
            .update_one(query, document.to_owned(), options)
            .await
    }

    pub async fn get(db: Database, id: &String) -> Result<Option<Prosumer>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        db.collection::<Prosumer>("prosumers").find_one(query, None).await
    }
}
pub struct ConsumerDocument;

impl ConsumerDocument {
    pub async fn insert(
        db: Database,
        item: Consumer,
    ) -> Result<results::UpdateResult, mongodb::error::Error> {
        let query = doc! {
            "id": &item.id
        };
        let bson_item = bson::to_bson(&item)?;
        let document = bson_item.as_document().unwrap();
        let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Consumer>("consumers")
            .update_one(query, document.to_owned(), options)
            .await
    }

    pub async fn get(db: Database, id: &String) -> Result<Option<Consumer>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        db.collection::<Consumer>("consumers").find_one(query, None).await
    }
}
pub struct ManagerDocument;

impl ManagerDocument {
    pub async fn insert(
        db: Database,
        item: Manager,
    ) -> Result<results::UpdateResult, mongodb::error::Error> {
        let query = doc! {
            "id": &item.id
        };
        let bson_item = bson::to_bson(&item)?;
        let document = bson_item.as_document().unwrap();
        let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Manager>("managers")
            .update_one(query, document.to_owned(), options)
            .await
    }

    pub async fn get(db: Database, id: &String) -> Result<Option<Manager>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        db.collection::<Manager>("managers").find_one(query, None).await
    }
}

pub struct DataPointsDocument;
