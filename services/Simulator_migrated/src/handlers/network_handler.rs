use lapin::{
    options::{BasicPublishOptions, ExchangeDeclareOptions},
    types::FieldTable,
    BasicProperties, Channel, Connection, ConnectionProperties,
};

use crate::models::network_types::SendFormat;

#[derive(Debug)]
pub struct NetworkHandler {
    // tx: broadcast::Sender<ReciveFormat>,
    // rx: broadcast::Receiver<ReciveFormat>
    connection: Option<Connection>,
    channel: Option<Channel>,
}

impl NetworkHandler {
    pub fn new() -> Self {
        // let (tx, rx) = broadcast::channel(1);
        Self {
            // tx,
            connection: None, // rx
            channel: None,    // TODO: multiple channels
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

    pub async fn create_channel(&mut self, name: String) -> Result<(), lapin::Error> {
        // println!("Creating channel {}", name);
        if let Some(connection) = &self.connection {
            if let Some(_) = &self.channel {
                return Ok(()); // channel is already created
            }
            let ch = connection.create_channel().await?;
            let table = FieldTable::default();
            let mut options = ExchangeDeclareOptions::default();
            options.durable = false;
            ch.exchange_declare(&name, lapin::ExchangeKind::Fanout, options, table)
                .await?;
            // ch.queue_declare(&name, options, table).await?;
            self.channel = Some(ch);
            return Ok(());
        } else {
            return Err(lapin::Error::InvalidConnectionState(
                lapin::ConnectionState::Closed,
            ));
        }
    }

    pub async fn send_normal(
        &self,
        network: String,
        items: Vec<SendFormat>,
    ) -> Result<(), lapin::Error> {
        if let Some(ch) = &self.channel {
            let json = serde_json::ser::to_vec(&items).unwrap();

            let default_panic = std::panic::take_hook();
            std::panic::set_hook(Box::new(move |info| {
                default_panic(info);
                std::process::exit(1);
            }));
            ch.basic_publish(
                &network,
                "",
                BasicPublishOptions::default(),
                &json,
                BasicProperties::default(),
            )
            .await
            .unwrap()
            .await
            .unwrap();
            return Ok(());
        } else {
            return Err(lapin::Error::InvalidChannel(0));
        }
    }
}

#[tokio::test]
async fn test_socket() {}
