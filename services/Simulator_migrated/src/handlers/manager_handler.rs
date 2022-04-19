use std::borrow::Borrow;
use std::cell::RefMut;
use std::collections::HashMap;

use crate::models::manager::Manager;

use std::sync::{Mutex, Once};
use std::{mem::MaybeUninit};

pub struct MHReader {
    pub inner: Mutex<ManagerHandler>,
}

pub fn manager_singleton() -> &'static MHReader {
    static mut SINGLETON: MaybeUninit<MHReader> = MaybeUninit::uninit();
    static ONCE: Once = Once::new();

    unsafe {
        ONCE.call_once(|| {
            let singleton = MHReader {
                inner: Mutex::new(ManagerHandler::new()),
            };
            SINGLETON.write(singleton);
        });

        SINGLETON.assume_init_ref()
    }
}

pub struct ManagerHandler {
    managers: HashMap<String, Manager>,
}

impl ManagerHandler {
    fn new() -> Self {
        let managers: HashMap<String, Manager> = HashMap::new();
        Self { managers }
    }

    pub fn add_manager(&mut self, manager: &Manager){
        self.managers.insert((*manager.id).to_string(), manager.clone());
    }

    pub fn get_manager(&mut self, id: &String) ->  Option<&mut Manager>{
        if let Some(rf) = self.managers.get_mut(id){
            return Some(rf);
        }else{
            return None;
        }
    }

    pub fn get_all(&mut self) -> Vec<&mut Manager>{
        Vec::from_iter(self.managers.values_mut())
    }
}
