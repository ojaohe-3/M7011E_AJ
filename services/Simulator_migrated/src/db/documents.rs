// use actix_web::error::InternalError;

use std::borrow::Borrow;

use futures::TryStreamExt;
use mongodb::{
    bson::{self, doc, DateTime, Document},
    options::UpdateOptions,
    results, Database,
};

use crate::{
    handlers::simulation_handler::Tickets,
    models::{
        appstructure::AppStructure,
        consumer::Consumer,
        manager::Manager,
        network_types::ReciveFormat,
        node::{CellType, Grid},
        prosumer::Prosumer,
        reports::{ConsumerReport, ManagerReport, ProsumerReport},
    },
};
//TODO: Structure into own files




pub struct ConsumerDocument;

impl ConsumerDocument {
    pub async fn insert(
        db: Database,
        item: Consumer,
    ) -> Result<results::InsertOneResult, mongodb::error::Error> {
        // let query = doc! {
        //     "id": &item.id
        // };
        // let bson_item = bson::to_bson(&item)?;
        // let document = bson_item.as_document().unwrap();
        // let options = UpdateOptions::builder().upsert(true).build();
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
}
pub struct ManagerDocument;

impl ManagerDocument {
    pub async fn insert(
        db: Database,
        item: Manager,
    ) -> Result<results::InsertOneResult, mongodb::error::Error> {
        let query = doc! {
            "id": &item.id
        };
        let bson_item = bson::to_bson(&item)?;
        let document = bson_item.as_document().unwrap();
        let options = UpdateOptions::builder().upsert(true).build();
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
}

pub struct DataPointsDocument;

impl DataPointsDocument {
    pub async fn insert_consumers(
        db: Database,
        item: &Vec<ConsumerReport>,
    ) -> Result<results::InsertManyResult, mongodb::error::Error> {
        // let document = bson_item.
        db.collection::<ConsumerReport>("datapoints")
            .insert_many(item, None)
            .await
    }
    pub async fn insert_prosumers(
        db: Database,
        item: &Vec<ProsumerReport>,
    ) -> Result<results::InsertManyResult, mongodb::error::Error> {
        db.collection::<ProsumerReport>("datapoints")
            .insert_many(item, None)
            .await
    }

    pub async fn insert_managers(
        db: Database,
        item: &Vec<ManagerReport>,
    ) -> Result<results::InsertManyResult, mongodb::error::Error> {
        db.collection::<ManagerReport>("datapoints")
            .insert_many(item, None)
            .await
    }

    pub async fn get_consumer(
        db: Database,
        time_stamp: DateTime,
    ) -> Result<Vec<ConsumerReport>, mongodb::error::Error> {
        let query = doc! {
            "time_stamp": {
                "$gte" : time_stamp.to_rfc3339_string(), "$lt": DateTime::now().to_rfc3339_string()
            },
        };
        let mut result = db
            .collection::<ConsumerReport>("datapoints")
            .find(query, None)
            .await?;
        let mut response = Vec::new();
        while let Some(res) = result.try_next().await? {
            response.push(res)
        }
        Ok(response)
    }
    pub async fn get_prosumer(
        db: Database,
        id: &String,
    ) -> Result<Vec<ProsumerReport>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        let mut result = db
            .collection::<ProsumerReport>("datapoints")
            .find(query, None)
            .await?;
        let mut response = Vec::new();
        while let Some(res) = result.try_next().await? {
            response.push(res)
        }
        Ok(response)
    }

    pub async fn get_manager(
        db: Database,
        id: &String,
    ) -> Result<Vec<ManagerReport>, mongodb::error::Error> {
        let query = doc! {
            "id": id
        };
        let mut result = db
            .collection::<ManagerReport>("datapoints")
            .find(query, None)
            .await?;
        let mut response = Vec::new();
        while let Some(res) = result.try_next().await? {
            response.push(res)
        }
        Ok(response)
    }
}
pub struct TicketDocuments;

impl TicketDocuments {
    pub async fn insert(
        db: Database,
        items: &Tickets,
    ) -> Result<results::InsertManyResult, mongodb::error::Error> {
        db.collection::<ReciveFormat>("tickets")
            .insert_many(items, None)
            .await
    }

    pub async fn get_from_source(
        db: Database,
        id: &String,
    ) -> Result<Tickets, mongodb::error::Error> {
        let query = doc! {
            "source": id
        };
        let mut tickets = Vec::new();
        let mut result = db
            .collection::<ReciveFormat>("tickets")
            .find(query, None)
            .await?;
        while let Some(res) = result.try_next().await? {
            tickets.push(res)
        }
        Ok(tickets)
    }
    pub async fn get_from_target(
        db: Database,
        id: &String,
    ) -> Result<Tickets, mongodb::error::Error> {
        let query = doc! {
            "target": id
        };
        let mut tickets = Vec::new();
        let mut result = db
            .collection::<ReciveFormat>("tickets")
            .find(query, None)
            .await?;
        while let Some(res) = result.try_next().await? {
            tickets.push(res)
        }
        Ok(tickets)
    }
}
