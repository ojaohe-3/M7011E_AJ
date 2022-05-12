use std::fmt::Display;

use actix_web::{ResponseError, HttpResponse, http::header::ContentType, web::Json};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseFormat{
    pub message: String,
    pub code: u32,
    // exception: Option<String>
}

impl ResponseFormat {
    pub fn new(msg: String) -> Self{
        Self{
            code: 200,
            message: msg
        }
    }
}

#[derive(Debug)]
pub enum WebRequestError{
    MemberNotFound, ActixError(Box<dyn ResponseError>), Other(String), MemberAlreadyExist,
    ResourceNotFound,  InvalidRange, ReqwestError(Box<reqwest::Error>),
    NotAuthorized, TooLowClearance(u32, u32), OutOfBounds
}

impl From<reqwest::Error> for WebRequestError {
    fn from(v: reqwest::Error) -> Self {
        Self::ReqwestError(Box::new(v))
    }
}

impl From<Box<dyn ResponseError>> for WebRequestError {
    fn from(v: Box<dyn ResponseError>) -> Self {
        Self::ActixError(v)
    }
}



impl Display for WebRequestError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{{ \"error\": \"{:?}\" }}", self)
    }
}

impl ResponseError for WebRequestError{

    fn error_response(&self) -> actix_web::HttpResponse<actix_web::body::BoxBody> {
     HttpResponse::build(self.status_code()).insert_header(ContentType::json()).body(self.to_string())
    }


}
