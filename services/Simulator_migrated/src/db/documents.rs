// use actix_web::error::InternalError;

use mongodb::{
    bson::{self, doc},
    options::UpdateOptions,
    results, Database,
};

use crate::models::{node::{Grid, CellType}, prosumer::Prosumer, consumer::Consumer, manager::Manager, appstructure::AppStructure};

pub struct AppDocument;

impl AppDocument {
    pub async fn insert(
        db: Database,
        item: AppStructure,
    ) -> Result<results::UpdateResult, mongodb::error::Error> {
        let query = doc! {
            "id": &item.id
        };
        let bson_item = bson::to_bson(&item)?;
        let document = bson_item.as_document().unwrap();
        let options = UpdateOptions::builder().upsert(true).build();
        db.collection::<Grid>("apps")
            .update_one(query, document.to_owned(), options)
            .await
    }

    pub async fn get(db: Database, name: &String) -> Result<Option<AppStructure>, mongodb::error::Error> {
        let query = doc! {
            "name": name
        };
        db.collection::<AppStructure>("apps").find_one(query, None).await
    }

    pub async fn get_grid(db: Database, id: &String) -> Result<Option<Grid>, mongodb::error::Error>{
        GridDocument::get(db, id).await
    }
}

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
    pub async fn get_consumers(db: Database, gr: Grid)-> Result<Option<Vec<Consumer>>, mongodb::error::Error>{
        let consumer_cells = gr.get_all_type(CellType::Conusmer);
        let mut result = Vec::new();
        for cell in consumer_cells{
            if let Some(c) = ConsumerDocument::get(db.clone(), &cell.id).await?{
                result.push(c); //TODO: join all
            }
        }

        Ok(Some(result))
    }
    pub async fn get_prosumers(db: Database, gr: Grid)-> Result<Option<Vec<Prosumer>>, mongodb::error::Error>{
        let prosumer_cells = gr.get_all_type(CellType::Conusmer);
        let mut result = Vec::new();
        for cell in prosumer_cells{
            if let Some(p) = ProsumerDocument::get(db.clone(), &cell.id).await?{
                result.push(p); //TODO: join all
            }
        }

        Ok(Some(result))
    }
    pub async fn get_managers(db: Database, gr: Grid)-> Result<Option<Vec<Manager>>, mongodb::error::Error>{
        let managers_cells = gr.get_all_type(CellType::Conusmer);
        let mut result = Vec::new();
        for cell in managers_cells{
            if let Some(m) = ManagerDocument::get(db.clone(), &cell.id).await?{
                result.push(m); //TODO: join all
            }
        }

        Ok(Some(result))
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
