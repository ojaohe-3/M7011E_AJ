use std::{
    env, fmt,
    sync::Arc,
    time::{Duration, Instant}, collections::HashMap,
};

use actix_web::{middleware::Logger, web, App, HttpServer};
use db::documents::ConsumerDocument;
use dotenv::dotenv;
use env_logger::Env;
use futures::{future::join_all, lock::Mutex, Future};
use handlers::network_handler::{self, ReciveFormat};
use mongodb::{bson::doc, options::ClientOptions, Client, Database};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};

use crate::{
    app::AppState,
    db::documents::{ManagerDocument, ProsumerDocument},
    handlers::{network_handler::{NetworkHandler, SendFormat}, simulation_handler::SimulationHandler},
    models::{consumer::Consumer, manager::Manager, prosumer::Prosumer},
};

mod api;
mod app;
mod db;
mod handlers;
mod middleware;
mod models;
type DocumentFuture<T> = dyn Future<Output = Result<Option<T>, mongodb::error::Error>>;
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
    let c = doc! { "ping": "1"};

    db.run_command(c, None)
        .await
        .expect("Could Not Connect to mongodb");
    println!("mongodb connected!");

    // ==== Fetch from db ====
    if let Some(name) = envs.NAME {}

    // ==== Build TLS encryption for https ====
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file("key.pem", SslFiletype::PEM)
        .unwrap();
    builder.set_certificate_chain_file("cert.pem").unwrap();

    // ==== Build application Data ====
    let sim = Arc::new(Mutex::new(SimulationHandler::new()));

    // TODO: Serve Rabbitmq
    let mut rmq = Arc::new(Mutex::new(NetworkHandler::new()));
    // TODO: Generate members object from db

    // let data = Arc::new(Mutex::new(AppState::new(db, client, sim.clone())));
    let data = web::Data::new(AppState::new(db.clone(), client.clone(), sim.clone()));
    let port = format!("127.0.0.1:{}", envs.PORT);
    println!(
        "Starting server on {}, toke {}s",
        port,
        instance.elapsed().as_secs_f64()
    );
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    // ==== Server serving the API ====
    let server = HttpServer::new(move || {
        let api = app::generate_api();
        App::new()
            .app_data(data.clone())
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .service(api)
    })
    .bind_openssl(port, builder)?
    .run();
    // ==== Simulation loop ====
    let simulation_loop = tokio::spawn(async move {
        let mut time = Instant::now();
        let mut long_time = Instant::now();
        let duration = Duration::from_secs_f64(1.0);
        let mut interval = tokio::time::interval(Duration::from_secs_f64(
            1. / SimulationHandler::LOOP_FREQUENCY,
        ));
        let mut send_map: HashMap<String, Vec<SendFormat>> = HashMap::new();
        rmq.lock()
            .await
            .connect()
            .await
            .expect("Failed to connect rabbitmq");
            println!("Starting Simulation");
        loop {
            interval.tick().await;
            sim.lock().await.process(time).await;
            time = Instant::now();
            if long_time.elapsed() > duration {
                sim.lock().await.fetch_weather().await;
                
                
                let rmq_ref = rmq.clone();
                let db = db.clone();
            
                let rs = sim.lock().await.generate_sendforms();
                let mut send_map = send_map;
                for (n, r) in rs{
                    if send_map.contains_key(&n){
                        send_map.get_mut(&n.to_string()).unwrap().push(r);
                    }else{
                        send_map.insert(n,vec![r]);
                    }
                }
                let mut rrqm = Vec::new();
                for (n, sr) in send_map.iter(){
                    rrqm.push(tokio::spawn(async move{
                        rmq_ref.clone().lock().await.send_rpc(n.to_string(), sr.to_vec()).await
                    }))
                }
                let result: Vec<Vec<ReciveFormat>>= join_all(rrqm).await.iter_mut().map(|v| v.unwrap().unwrap()).collect();

                let cs: Vec<Consumer> = sim.lock().await.consumers.iter().cloned().collect();
                let ms: Vec<Manager> = sim.lock().await.managers.iter().cloned().collect();
                let ps: Vec<Prosumer> = sim.lock().await.prosumers.iter().cloned().collect();

                let mut ct = Vec::new();
                let mut pt = Vec::new();
                let mut mt = Vec::new();

                for c in cs {
                    let db_ref = db.clone();
                    ct.push(tokio::spawn(
                        async move { ConsumerDocument::insert(db_ref, c) },
                    ))
                }
                for p in ps {
                    let db_ref = db.clone();
                    pt.push(tokio::spawn(
                        async move { ProsumerDocument::insert(db_ref, p) },
                    ))
                }
                for m in ms {
                    let db_ref = db.clone();
                    mt.push(tokio::spawn(
                        async move { ManagerDocument::insert(db_ref, m) },
                    ))
                }

                join_all(ct).await;
                join_all(pt).await;
                join_all(mt).await;
                long_time = Instant::now();
                send_map.clear();
            }
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
