use std::sync::Arc;

use actix_web::{self, web, Scope};
use actix_web_httpauth::extractors::bearer::Config;
use futures::lock::Mutex;


pub fn generate_api() -> Scope {
    web::scope(&format!("/api"))
        .app_data(Config::default().scope("Unauthorized").realm("api"))
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
