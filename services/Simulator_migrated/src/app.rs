use actix_web::{self, web, Scope};

use crate::api::{self, control, members, datapoints};

pub fn generate_api() -> Scope {
    web::scope(&format!("/api/v1"))
        .service(members::managers::construct_service())
        .service(members::prosumers::construct_service())
        .service(members::consumers::construct_service())
        .service(control::manager_controller::construct_service())
        .service(control::prosumer_controller::construct_service())
        .service(datapoints::construct_service())
        .service(members::grid::construct_service())
}
