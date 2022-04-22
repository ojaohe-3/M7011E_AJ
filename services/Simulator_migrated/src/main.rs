

use std::{fmt, env};

use dotenv::{dotenv};

use crate::handlers::simulation_handler::simulation_singleton;

mod models;
mod handlers;
mod db;
mod middleware;
mod api;
mod app;


fn main() {
    dotenv().ok();
    
    let envs = match assert_all_env_loaded(){
        Ok(v) => v,
        Err(e) => panic!("{}", e),
    };
    println!("env file loaded!");
    // let sim = simulation_singleton();
    
    // TODO: Serve Rabbitmq
    // TODO: Serve Mongodb connector
    // TODO: Generate members object from db
    // TODO: Generate API
    // TODO: declare thread for simulation
    
    // println!("{:?}", envs);
    

}


#[derive(Debug, Clone)]
enum EnvKey {
    DB_CONNECT, LAT, LON, AUTH_ENDPOINT, RABBITMQ_CONNECTION_STRING, 
}

#[derive(Clone, Debug)]
struct EnvErrors{
    keys: Vec<EnvKey>,
}

impl EnvErrors {
    fn new(keys: Vec<EnvKey>) -> Self { Self { keys } }
}

impl fmt::Display for EnvErrors {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Env missing required keys {:?}",  self.keys)
    }
}

fn assert_all_env_loaded() -> Result<Envs, EnvErrors>{
    let mut missing: Vec<EnvKey> = Vec::new();
    
    if env::var("DB_CONNECT").is_err(){
        missing.push(EnvKey::DB_CONNECT);
    }
    if env::var("LAT").is_err(){
        missing.push(EnvKey::LAT);
    }if env::var("LON").is_err(){
        missing.push(EnvKey::LON);
    }if env::var("AUTH_ENDPOINT").is_err(){
        missing.push(EnvKey::AUTH_ENDPOINT);
    }if env::var("RABBITMQ_CONNECTION_STRING").is_err(){
        missing.push(EnvKey::RABBITMQ_CONNECTION_STRING);
    }
    
    if missing.len() > 0{
        return Err(EnvErrors::new(missing))
    }



    Ok(Envs{
        NAME:env::var("NAME").ok(),
        DB_CONNECT: env::var("DB_CONNECT").ok().unwrap(),
        API_URL:env::var("API_URL").ok(),
        LAT: env::var("LAT").ok().unwrap().parse::<f64>().unwrap(),
        LON: env::var("LON").ok().unwrap().parse::<f64>().unwrap(),
        WEATHER_MODULE: env::var("WEATHER_MODULE").ok(),
        AUTH_ENDPOINT: env::var("AUTH_ENDPOINT").ok().unwrap(),
        RABBITMQ_CONNECTION_STRING: env::var("RABBITMQ_CONNECTION_STRING").ok().unwrap(),
        RABBITMQ_USER: env::var("RABBITMQ_USER").ok(),
        RABBITMQ_PASS: env::var("RABBITMQ_PASS").ok(),
        PORT: match env::var("PORT").ok().unwrap().parse::<u32>(){
            Ok(v) => v,
            Err(_) => 5000,
        },
    })
}


// TODO make into #[structopt(name = "simulation web service", about = "Creates an performant web instance with a connecting api, rabbitmq connection etc")]
#[derive(Clone, Debug)]
struct Envs{
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
    PORT: u32
}

