use app_state::AppState;
use tokio::join;
use actix_cors::Cors;
use actix_web::{http::header, middleware::Logger, web, App, HttpServer};

pub mod api;
mod app_state;
pub mod auth;
pub mod controllers;
pub mod models;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    // ==== Building DI ====
    let app_state = AppState::new();

    // ==== Build TLS encryption for https ====
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file("key.pem", SslFiletype::PEM)
        .unwrap();
    builder.set_certificate_chain_file("cert.pem").unwrap();
    let port: u32 = 5001;
    let server = HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
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

    let grpc = async move {
        tokio::task::spawn(
            Server::builder()
                .add_service(HelloServer::new(hello_service))
                .serve(gaddr),
        )
    };
    let mut erf: u8 = 0;
    tokio::select! {
        erf = grpc => 10,
        erf = server => 11,

    };
    println!("close code {erf}");
    Ok(())
}
