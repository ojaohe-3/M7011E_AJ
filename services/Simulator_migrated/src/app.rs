use std::sync::Arc;

use actix_web::{self, web, Scope};
use futures::lock::Mutex;
use mongodb::{Client, Database};

use crate::{
    api::{control, datapoints, grid, members},
    handlers::simulation_handler::SimulationHandler,
};

#[derive(Clone, Debug)]
pub struct AppState {
    pub db: Database,
    pub client: Client,
    // pub auth_client: AuthClient
    pub sim: Arc<Mutex<SimulationHandler>>,
}

impl AppState {
    pub fn new(db: Database, client: Client, sim: Arc<Mutex<SimulationHandler>>) -> Self {
        Self { db, client, sim }
    }
}

pub fn generate_api() -> Scope {
    web::scope(&format!("/api/v1"))
        .service(
            web::scope(&format!("/members"))
                .service(members::managers::construct_service())
                .service(members::prosumers::construct_service())
                .service(members::consumers::construct_service()),
        )
        .service(
            web::scope(&format!("/controls"))
                .service(control::manager_controller::construct_service())
                .service(control::prosumer_controller::construct_service()),
        )
        .service(datapoints::construct_service())
        .service(grid::construct_service())
}
