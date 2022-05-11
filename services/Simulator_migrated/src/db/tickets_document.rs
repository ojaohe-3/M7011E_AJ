use futures::TryStreamExt;
use mongodb::{Database, bson::doc, results};

use crate::{handlers::simulation_handler::Tickets, models::network_types::ReciveFormat};

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