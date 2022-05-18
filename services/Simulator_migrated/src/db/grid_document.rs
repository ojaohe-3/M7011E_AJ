use mongodb::{
    bson::{self, doc},
    options::UpdateOptions,
    results, Database,
};

use crate::models::{
    consumer::Consumer,
    manager::Manager,
    node::{CellType, Grid},
    prosumer::Prosumer,
};

use super::{
    consumer_document::ConsumerDocument, manager_document::ManagerDocument,
    prosumer_document::ProsumerDocument,
};

pub struct GridDocument;

impl GridDocument {
    pub async fn insert(
        db: Database,
        item: &Grid,
    ) -> Result<results::InsertOneResult, mongodb::error::Error> {
        db.collection::<Grid>("grids")
            .insert_one(item.to_owned(), None)
            .await
    }
    pub async fn update(
        db: Database,
        id: &String,
        grid: &Grid,
    ) -> Result<results::UpdateResult, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        let width = bson::to_bson(&grid.width).unwrap();
        let height =  bson::to_bson(&grid.height).unwrap();
        let nodes = bson::to_bson(&grid.nodes).unwrap();
        let update = doc! {
            "$set" : { "width": &width, "height":&height, "nodes":  nodes}
        };

        let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Grid>("grids")
            .update_one(query, update.to_owned(), options)
            .await
    }

    pub async fn get(db: Database, id: &String) -> Result<Option<Grid>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        db.collection::<Grid>("grids").find_one(query, None).await
    }
    pub async fn get_consumers(
        db: Database,
        gr: &Grid,
    ) -> Result<Vec<Consumer>, mongodb::error::Error> {
        let consumer_cells = gr.get_all_type(CellType::Conusmer);
        let mut result = Vec::new();
        for cell in consumer_cells {
            if let Some(c) = ConsumerDocument::get(db.clone(), &cell.id).await? {
                result.push(c);
            }
        }

        Ok(result)
    }
    pub async fn get_prosumers(
        db: Database,
        gr: &Grid,
    ) -> Result<Vec<Prosumer>, mongodb::error::Error> {
        let prosumer_cells = gr.get_all_type(CellType::Prosumer);
        let mut result = Vec::new();
        for cell in prosumer_cells {
            if let Some(p) = ProsumerDocument::get(db.clone(), &cell.id).await? {
                result.push(p); //TODO: join all
            }
        }

        Ok(result)
    }
    pub async fn get_managers(
        db: Database,
        gr: &Grid,
    ) -> Result<Vec<Manager>, mongodb::error::Error> {
        let managers_cells = gr.get_all_type(CellType::Manager);
        let mut result = Vec::new();
        for cell in managers_cells {
            if let Some(m) = ManagerDocument::get(db.clone(), &cell.id).await? {
                result.push(m); //TODO: join all
            }
        }

        Ok(result)
    }
}
