
use mongodb::{
    results, Database, bson::doc,
};

use crate::{
       models::{
        appstructure::AppStructure,
        // node::{Grid},
    },
};

// use super::grid_document::GridDocument;
pub struct AppDocument;

impl AppDocument {
    pub async fn insert(
        db: Database,
        item: &AppStructure,
    ) -> Result<results::InsertOneResult, mongodb::error::Error> {
        // let query = doc! {
        //     "id": &item.id
        // };
        // let bson_item = bson::to_bson(&item)?;
        // let document = bson_item.as_document().unwrap();
        // let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<AppStructure>("apps")
            .insert_one(item.to_owned(), None)
            .await
    }

    pub async fn get(
        db: Database,
        name: &String,
    ) -> Result<Option<AppStructure>, mongodb::error::Error> {
        let query = doc! {
            "name": name
        };
        db.collection::<AppStructure>("apps")
            .find_one(query, None)
            .await
    }

    // pub async fn get_grid(
    //     db: Database,
    //     id: &String,
    // ) -> Result<Option<Grid>, mongodb::error::Error> {
    //     GridDocument::get(db, id).await
    // }
}