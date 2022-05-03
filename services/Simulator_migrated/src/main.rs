use std::{
    env, fmt,
    sync::Arc,
    time::{Duration, Instant},
};

use actix_web::{middleware::Logger, web, App, HttpServer};
use dotenv::dotenv;
use futures::lock::Mutex;
use mongodb::{bson::doc, options::ClientOptions, Client};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};

use crate::{app::AppState, handlers::simulation_handler::SimulationHandler};

mod api;
mod app;
mod db;
mod handlers;
mod middleware;
mod models;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let instance = Instant::now();
    // ==== Assert enviormental variables
    dotenv().ok();

    let envs = match assert_all_env_loaded() {
        Ok(v) => v,
        Err(e) => panic!("{}", e),
    };
    // std::env::set_var("RUST_LOG", "debug");
    // std::env::set_var("RUST_BACKTRACE", "1");
    println!("env file loaded!");

    // ==== Connect and configure mongodb connector ====
    let options = ClientOptions::parse(envs.DB_CONNECT)
        .await
        .expect("Could not get database");

    let client = Client::with_options(options).expect("Failed to create client!");
    let db = client.database("AJ");
    let c = doc! { "ping": 1};
    db.run_command(c, None)
        .await
        .expect("Could Not Connect to mongodb");
    println!("mongodb connected!");

    // ==== Build TLS encryption for https ====
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file("key.pem", SslFiletype::PEM)
        .unwrap();
    builder.set_certificate_chain_file("cert.pem").unwrap();

    // ==== Build application Data ====
    let sim = Arc::new(Mutex::new(SimulationHandler::new()));

    // TODO: Serve Rabbitmq
    // TODO: Generate members object from db

    // let data = Arc::new(Mutex::new(AppState::new(db, client, sim.clone())));
    let data = web::Data::new(AppState::new(db, client, sim.clone()));
    let port = format!("127.0.0.1:{}", envs.PORT);
    println!(
        "Starting server on {}, toke {}s",
        port,
        instance.elapsed().as_secs_f64()
    );
    // ==== Server serving the API ====
    let server = HttpServer::new(move || {
        let api = app::generate_api();
        // let data = web::Data::new(AppData{
        //     sim
        // });
        App::new()
            .app_data(data.clone())
            .wrap(Logger::default())
            // .wrap(Logger::new("%a %{User-Agent}i"))
            .service(api)
    })
    .bind_openssl(port, builder)?
    .run();
    // ==== Simulation loop ====
    let simulation_loop = tokio::spawn(async move {
        let mut time = Instant::now();
        let mut interval = tokio::time::interval(Duration::from_secs_f64(
            1. / SimulationHandler::LOOP_FREQUENCY,
        ));
        //TODO: read broadcasts
        println!("Starting Simulation");
        // let sim = simulation_singleton();
        loop {
            interval.tick().await;
            sim.lock().await.process(time).await;
            time = Instant::now();
        }
    });

    tokio::select! {
        _ = simulation_loop => 0,
        _ = server => 0,
    };
    return Ok(());
}

#[derive(Debug, Clone)]
enum EnvKey {
    DB_CONNECT,
    LAT,
    LON,
    AUTH_ENDPOINT,
    RABBITMQ_CONNECTION_STRING,
}

#[derive(Clone, Debug)]
struct EnvErrors {
    keys: Vec<EnvKey>,
}

impl EnvErrors {
    fn new(keys: Vec<EnvKey>) -> Self {
        Self { keys }
    }
}

impl fmt::Display for EnvErrors {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Env missing required keys {:?}", self.keys)
    }
}

fn assert_all_env_loaded() -> Result<Envs, EnvErrors> {
    let mut missing: Vec<EnvKey> = Vec::new();

    if env::var("DB_CONNECT").is_err() {
        missing.push(EnvKey::DB_CONNECT);
    }
    if env::var("LAT").is_err() {
        missing.push(EnvKey::LAT);
    }
    if env::var("LON").is_err() {
        missing.push(EnvKey::LON);
    }
    if env::var("AUTH_ENDPOINT").is_err() {
        missing.push(EnvKey::AUTH_ENDPOINT);
    }
    if env::var("RABBITMQ_CONNECTION_STRING").is_err() {
        missing.push(EnvKey::RABBITMQ_CONNECTION_STRING);
    }

    if missing.len() > 0 {
        return Err(EnvErrors::new(missing));
    }

    Ok(Envs {
        NAME: env::var("NAME").ok(),
        DB_CONNECT: env::var("DB_CONNECT").ok().unwrap(),
        API_URL: env::var("API_URL").ok(),
        LAT: env::var("LAT").ok().unwrap().parse::<f64>().unwrap(),
        LON: env::var("LON").ok().unwrap().parse::<f64>().unwrap(),
        WEATHER_MODULE: env::var("WEATHER_MODULE").ok(),
        AUTH_ENDPOINT: env::var("AUTH_ENDPOINT").ok().unwrap(),
        RABBITMQ_CONNECTION_STRING: env::var("RABBITMQ_CONNECTION_STRING").ok().unwrap(),
        RABBITMQ_USER: env::var("RABBITMQ_USER").ok(),
        RABBITMQ_PASS: env::var("RABBITMQ_PASS").ok(),
        PORT: match env::var("PORT").ok().unwrap().parse::<u32>() {
            Ok(v) => v,
            Err(_) => 5000,
        },
    })
}

// TODO make into #[structopt(name = "simulation web service", about = "Creates an performant web instance with a connecting api, rabbitmq connection etc")]
#[derive(Clone, Debug)]
struct Envs {
    NAME: Option<String>,
    DB_CONNECT: String,
    API_URL: Option<String>,
    LAT: f64,
    LON: f64,
    WEATHER_MODULE: Option<String>,
    AUTH_ENDPOINT: String,
    RABBITMQ_CONNECTION_STRING: String,
    RABBITMQ_USER: Option<String>,
    RABBITMQ_PASS: Option<String>,
    PORT: u32,
}
