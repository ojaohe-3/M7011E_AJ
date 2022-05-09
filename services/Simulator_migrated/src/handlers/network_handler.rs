use std::fmt::Display;

use futures::StreamExt;
use lapin::{
    options::{BasicConsumeOptions, BasicPublishOptions, QueueDeclareOptions},
    types::{FieldTable, ShortString},
    BasicProperties, Connection, ConnectionProperties,
};
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum KeyTypes {
    Source,
    Consumer,
}
impl Display for KeyTypes {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            KeyTypes::Source => write!(f, "source"),
            KeyTypes::Consumer => write!(f, "consumer"),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]

pub struct ReciveFormat {
    target: String,
    price: f64,
    source: String,
    amount: f64,
}

impl ReciveFormat {
    pub fn new(target: String, price: f64, source: String, amount: f64) -> Self {
        Self {
            target,
            price,
            source,
            amount,
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SendFormat {
    key_type: KeyTypes,
    amount: f64,
    id: String,
    price: Option<f64>,
    additional: Option<f64>,
}

impl SendFormat {
    pub fn new(
        key_type: KeyTypes,
        amount: f64,
        id: String,
        price: Option<f64>,
        additional: Option<f64>,
    ) -> Self {
        Self {
            key_type,
            amount,
            id,
            price,
            additional,
        }
    }
}

pub struct NetworkHandler {
    tx: broadcast::Sender<ReciveFormat>,
    // rx: broadcast::Receiver<ReciveFormat>
    connection: Option<Connection>,
}

impl NetworkHandler {
    pub fn new() -> Self {
        let (tx, rx) = broadcast::channel(1);
        Self {
            tx,
            connection: None, // rx
        }
    }
    pub async fn connect(&mut self) -> Result<(), lapin::Error> {
        let mut uri = dotenv::var("RABBITMQ_CONNECTION_STRING").unwrap();

        let user = dotenv::var("RABBITMQ_USER").ok();
        let pass = dotenv::var("RABBITMQ_PASS").ok();

        let options = ConnectionProperties::default()
            .with_executor(tokio_executor_trait::Tokio::current())
            .with_reactor(tokio_reactor_trait::Tokio);
        if let Some(pass) = pass {
            // by our invariace starting this program user have to be set
            let user = user.unwrap();
            let i: Vec<&str> = uri.split('/').collect();
            uri = format!(
                "{}//{}:{}@{}",
                i[0].to_string(),
                user,
                pass,
                i[2].to_string()
            )
        }
        self.connection = Some(Connection::connect(&uri, options).await?);
        Ok(())
    }

    pub async fn create_channel(&self) -> Result<lapin::Channel, lapin::Error> {
        match &self.connection {
            Some(c) => c.create_channel().await,
            None => Err(lapin::Error::InvalidChannel(0)),
        }
    }

    pub async fn send_rpc(
        &self,
        network: String,
        items: Vec<SendFormat>,
    ) -> Result<Vec<ReciveFormat>, lapin::Error> {
        let json = serde_json::ser::to_vec(&items).unwrap();

        let ch = self.create_channel().await?;
        let table = FieldTable::default();
        let mut options = QueueDeclareOptions::default();
        options.exclusive = true;
        let cid = uuid::Uuid::new_v4().to_string();
        let queue = ch.queue_declare(&format!(""), options, table).await?;
        // let call_back = queue.name();
        ch.basic_publish(
            "",
            &network,
            BasicPublishOptions::default(),
            &json,
            BasicProperties::default()
                .with_correlation_id(ShortString::from(cid.to_string()))
                .with_reply_to(queue.name().clone()),
        )
        .await?;
        let mut coptions = BasicConsumeOptions::default();
        coptions.no_ack = true;
        let mut consumer = ch
            .basic_consume(queue.name().as_str(), "", coptions, FieldTable::default())
            .await?;
        let task = tokio::spawn(async move {
            let cid: String = cid.to_string();
            while let Some(delv) = consumer.next().await {
                let delv = match delv {
                    Ok(v) => v,
                    Err(_) => return None,
                };

                let id = delv.properties.correlation_id();
                if let Some(id) = id {
                    if id.eq(&ShortString::from(cid.to_string())) {
                        let data = serde_json::from_slice::<Vec<ReciveFormat>>(&delv.data).ok();
                        return data;
                    }
                }
            }
            return None;
        });
        match task.await.expect("join error") {
            Some(v) => Ok(v),
            None => Ok(vec![]),
        }
    }

    pub fn subscribe(&self) -> broadcast::Receiver<ReciveFormat> {
        self.tx.subscribe()
    }
}
