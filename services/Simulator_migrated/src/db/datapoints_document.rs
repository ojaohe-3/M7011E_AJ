use futures::TryStreamExt;
use mongodb::{Database, bson::{doc, DateTime}, results};

use crate::models::reports::{ManagerReport, ProsumerReport, ConsumerReport};

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