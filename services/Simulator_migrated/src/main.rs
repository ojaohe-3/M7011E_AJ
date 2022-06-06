use std::{
    collections::HashMap,
    env, fmt,
    sync::Arc,
    time::{Duration, Instant},
};

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer, http::header};
use db::{
    consumer_document::ConsumerDocument, manager_document::ManagerDocument,
    prosumer_document::ProsumerDocument, tickets_document::TicketDocuments,
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
    assert_all_env_loaded().expect("Failed to load envs");
    // std::env::set_var("RUST_LOG", "debug");
    // std::env::set_var("RUST_BACKTRACE", "1");
    println!("env file loaded!");

    // ==== Connect and configure mongodb connector ====
    let options = ClientOptions::parse(dotenv::var("DB_CONNECT").unwrap())
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
    let rmq = Arc::new(Mutex::new(NetworkHandler::new()));
    // TODO: Generate members object from db
    // ==== Fetch from db ====
    let mut app_state = AppStructure {
        id: uuid::Uuid::new_v4().to_string(),
        name: format!("Sim-{}", uuid::Uuid::new_v4().to_string()),
        grid: sim.lock().await.grid.id.to_string(),
    };
    if let Some(name) = dotenv::var("NAME").ok() {
        println!("found an name trying to fetch from mongodb");
        let db_ref = db.clone();
        app_state.name = name.to_string();
        // instant might alread exist in the database thusly we want to add this to our simulation
        if let Some(a) = AppDocument::get(db_ref.clone(), &name).await.unwrap() {
            println!("found and entry applying...");
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
                for c in &cs {
                    sim.lock().await.add_consumer(c.clone())
                }

                for p in &ps {
                    sim.lock().await.add_prosumer(p.clone())
                }

                for m in &ms {
                    sim.lock().await.add_manager(m.clone())
                }
                println!(
                    "added {} managers, {} consumers and {} prosumers to simulation!",
                    ms.len(),
                    cs.len(),
                    ps.len()
                );
            }
            println!("simulation successfully applied!");
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
    let port: u32 = match dotenv::var("PORT") {
        Ok(v) => {
            if let Ok(v) = v.parse() {
                v
            } else {
                panic!("{} invalid port format!", v)
            }
        }
        Err(_) => 5000,
    };
    let binding = format!("127.0.0.1:{}", port);
    println!(
        "Starting server on {}, start time {}s",
        binding,
        instance.elapsed().as_secs_f64()
    );
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    // ==== Server serving the API ====

    let server = HttpServer::new(move || {
        let cors = Cors::default()
        .allowed_origin("localhost")
        .allowed_methods(vec!["GET", "POST", "PUT"])
        .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
        .allowed_header(header::CONTENT_TYPE)
        .max_age(3600);
        let api = app::generate_api();
        // let auth = HttpAuthentication::bearer(middleware::auth::validator);
        App::new()
            .app_data(data.clone())
            .wrap(cors)
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            // .wrap(auth)
            .service(api)
    })
    .bind_openssl(binding, builder)?
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
        let mut time_elapsed = Instant::now();
        println!("starting informer loop");
        loop {
            interval.tick().await;
            // print!("\r updating dependencies... time: {:.2}s", total_time.elapsed().as_secs_f64());
            // === fetch weather ===
            sim_ref.clone().lock().await.fetch_weather().await;

            // === inform the rabbitmq instant of new data and fetch it ===
            let rmq_ref = rmq.clone();

            let rs = sim_ref.clone().lock().await.generate_sendforms(time_elapsed.elapsed().as_secs_f64());
            time_elapsed = Instant::now();
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
                if let Some(res) = res {
                    println!("response rmq: {:?}", res);
                    if res.len() > 0 {
                        TicketDocuments::insert(db_ref.clone(), &res).await.ok();
                    }
                } else {
                    println!("failed to call rpc...");
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
                c.document(db_ref).await.unwrap();
            }
            for p in ps {
                let db_ref = db_ref.clone();
                p.document(db_ref).await.unwrap();
            }
            for m in ms {
                let db_ref = db_ref.clone();
                m.document(db_ref).await.unwrap();
            }

            // join_all(ct).await;
            // join_all(pt).await;
            // join_all(mt).await;

            send_map.clear();
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
        _ = informer => 0,
        _ = flusher => 0,
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
        write!(f, "Env missing required keys: {:?}", self.keys)
    }
}

fn assert_all_env_loaded() -> Result<(), EnvErrors> {
    let mut missing: Vec<EnvKey> = Vec::new();

    // TODO: make into list and just pare all envs loaded, all missing will be part of hash set
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
    Ok(())
}

