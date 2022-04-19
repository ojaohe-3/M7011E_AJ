use std::cell::{RefCell, RefMut};
use std::collections::HashMap;
use std::sync::{Mutex, Once};
use std::{mem::MaybeUninit};

use crate::models::prosumer::Prosumer;


pub struct PHReader {
    pub inner: Mutex<ProsumerHandler>,
}

pub fn prosumer_singleton() -> &'static PHReader {
    static mut SINGLETON: MaybeUninit<PHReader> = MaybeUninit::uninit();
    static ONCE: Once = Once::new();

    unsafe {
        ONCE.call_once(|| {
            let singleton = PHReader {
                inner: Mutex::new(ProsumerHandler::new()),
            };
            SINGLETON.write(singleton);
        });

        SINGLETON.assume_init_ref()
    }
}

pub struct ProsumerHandler{
    prosumers: HashMap<String, Prosumer>,

}

impl ProsumerHandler {
    pub fn new() -> Self { Self { prosumers: HashMap::new() } }

    pub fn add_prosumer(&mut self, prosumer: &Prosumer){
        self.prosumers.insert((*prosumer.id).to_string(), prosumer.clone());
    }

    pub fn get_prosumer(&mut self, id: &String) ->  Option<&mut Prosumer>{
        if let Some(rf) = self.prosumers.get_mut(id){
            return Some(rf);
        }else{
            return None;
        }
    }

    pub fn get_all(&mut self) -> Vec<&mut Prosumer>{
        Vec::from_iter(self.prosumers.values_mut())
    }
}