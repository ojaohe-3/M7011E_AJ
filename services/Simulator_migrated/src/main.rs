use std::{
    collections::HashMap,
    env, fmt,
    sync::Arc,
    time::{Duration, Instant},
};

use actix_web::{middleware::Logger, web, App, HttpServer};
use db::{
    consumer_document::ConsumerDocument, manager_document::ManagerDocument,
    prosumer_document::ProsumerDocument,
};
use dotenv::dotenv;
use env_logger::Env;
use futures::{future::join_all, lock::Mutex, Future};
use handlers::network_handler::{self};
use models::{appstructure::AppStructure, network_types::SendFormat};
use mongodb::{bson::doc, options::ClientOptions, Client, Database};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};

use crate::{
    app::AppState,
    db::{app_document::AppDocument, grid_document::GridDocument},
    handlers::{network_handler::NetworkHandler, simulation_handler::SimulationHandler},
    models::{consumer::Consumer, manager::Manager, prosumer::Prosumer},
};

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
    let c = doc! { "ping": "1"};

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
    let mut rmq = Arc::new(Mutex::new(NetworkHandler::new()));
    // TODO: Generate members object from db
    // ==== Fetch from db ====
    let mut app_state = AppStructure {
        id: uuid::Uuid::new_v4().to_string(),
        name: format!("Sim-{}", uuid::Uuid::new_v4().to_string()),
        grid: sim.lock().await.grid.id.to_string(),
    };
    if let Some(name) = envs.NAME {
        println!("found an name trying to fetch from mongodb");
        let db_ref = db.clone();
        app_state.name = name.to_string();
        // instant might alread exist in the database thusly we want to add this to our simulation
        if let Some(a) = AppDocument::get(db_ref.clone(), &name).await.unwrap() {
            println!("found and entrie applying...");
            app_state = a;
            if let Some(grid) = GridDocument::get(db_ref.clone(), &app_state.grid.to_string())
                .await
                .unwrap()
            {
                sim.lock().await.grid = grid.clone();
                let cs = GridDocument::get_consumers(db_ref.clone(), &grid)
                    .await
                    .unwrap();
                let ps = GridDocument::get_prosumers(db_ref.clone(), &grid)
                    .await
                    .unwrap();
                let ms = GridDocument::get_managers(db_ref.clone(), &grid)
                    .await
                    .unwrap();
                for c in cs {
                    sim.lock().await.add_consumer(c.clone())
                }

                for p in ps {
                    sim.lock().await.add_prosumer(p.clone())
                }

                for m in ms {
                    sim.lock().await.add_manager(m.clone())
                }
            }
            println!("simulation succefully applied!");
        } else {
            println!("did not find the entry creating new...");
            let db_ref = db.clone();
            GridDocument::insert(db_ref.clone(), &sim.lock().await.grid.clone())
                .await
                .expect("failed to insert Grid");
            AppDocument::insert(db_ref.clone(), &app_state)
                .await
                .expect("failed to insert App document");
            println!("created {} app!", app_state.name);
        }
    } else {
        println!("did not specify name creating new...");
        let db_ref = db.clone();
        GridDocument::insert(db_ref.clone(), &sim.lock().await.grid.clone())
            .await
            .expect("failed to insert Grid");
        AppDocument::insert(db_ref.clone(), &app_state)
            .await
            .expect("failed to insert App document");

        println!("created {} app!", app_state.name);
        // we are creating a new non existing example
    }

    // let data = Arc::new(Mutex::new(AppState::new(db, client, sim.clone())));
    let data = web::Data::new(AppState::new(db.clone(), client.clone(), sim.clone()));

    let port = format!("127.0.0.1:{}", envs.PORT);
    println!(
        "Starting server on {}, start time {}s",
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
    let sim1 = sim.clone();
    let db1 = db.clone();
    // ==== Simulation loop ====
    let simulation_loop = tokio::spawn(async move {
        // let total_time = Instant::now();
        let mut time = Instant::now();
        let mut interval = tokio::time::interval(Duration::from_secs_f64(
            1. / SimulationHandler::LOOP_FREQUENCY,
        ));
        let sim_ref = sim1.clone();
        let db_ref = db1.clone();
        println!("Starting Simulation");
        loop {
            interval.tick().await;
            sim_ref
                .lock()
                .await
                .process(time, Some(db_ref.clone()))
                .await;
            time = Instant::now();
        }
    });
    let sim2 = sim.clone();
    let db2 = db.clone();
    let informer = tokio::spawn(async move {
        let mut send_map: HashMap<String, Vec<SendFormat>> = HashMap::new();
        let sim_ref = sim2.clone();
        let db_ref = db2.clone();
        rmq.lock()
            .await
            .connect()
            .await
            .expect("Failed to connect rabbitmq");
        // let mut time = Instant::now();
        let mut interval = tokio::time::interval(Duration::from_secs_f64(1.));
        println!("starting informer loop");
        loop {
            interval.tick().await;
            // print!("\r updating dependencies... time: {:.2}s", total_time.elapsed().as_secs_f64());
            // === fetch weather ===
            sim_ref.clone().lock().await.fetch_weather().await;

            // === inform the rabbitmq instant of new data and fetch it ===
            let rmq_ref = rmq.clone();

            let rs = sim_ref.clone().lock().await.generate_sendforms();
            for (n, r) in rs {
                if send_map.contains_key(&n) {
                    send_map.get_mut(&n.to_string()).unwrap().push(r);
                } else {
                    send_map.insert(n, vec![r]);
                }
            }
            for (n, sr) in send_map.iter() {
                let rmq = rmq_ref.clone();

                let res = rmq
                    .lock()
                    .await
                    .send_rpc(n.to_string(), sr.to_vec())
                    .await
                    .ok();
                if let Some(mut recieved) = res {
                    sim_ref
                        .clone()
                        .lock()
                        .await
                        .append_recive_formats(&mut recieved);
                }
            }
            // === Update Database of current state ===

            let cs: Vec<Consumer> = sim_ref
                .clone()
                .lock()
                .await
                .consumers
                .iter()
                .cloned()
                .collect();
            let ms: Vec<Manager> = sim_ref
                .clone()
                .lock()
                .await
                .managers
                .iter()
                .cloned()
                .collect();
            let ps: Vec<Prosumer> = sim_ref
                .clone()
                .lock()
                .await
                .prosumers
                .iter()
                .cloned()
                .collect();

            // let mut ct = Vec::new();
            // let mut pt = Vec::new();
            // let mut mt = Vec::new();

            for c in cs {
                let db_ref = db_ref.clone();
                c.document(db_ref).await.ok();
            }
            for p in ps {
                let db_ref = db_ref.clone();
                p.document(db_ref).await.ok();
            }
            for m in ms {
                let db_ref = db_ref.clone();
                m.document(db_ref).await.ok();
            }

            // join_all(ct).await;
            // join_all(pt).await;
            // join_all(mt).await;

            // send_map.clear();
        }
    });
    let db3 = db.clone();
    let sim3 = sim.clone();
    let flusher = tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs_f64(500.));
        println!("starting data gathering loop");
        let sim_ref = sim3.clone();
        loop {
            let db_ref = db3.clone();
            interval.tick().await;
            sim_ref.lock().await.data_handler.flush(db_ref).await.ok();
        }
    });
    tokio::select! {
        _ = simulation_loop => 0,
        _ = server => 0,
        _ = informer => 0,
        _ = flusher => 0,
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
