
use std::sync::{Mutex, Once};
use std::{mem::MaybeUninit};


pub struct NHReader {
    pub inner: Mutex<NetworkHandler>,
}

pub fn network_singleton() -> &'static NHReader {
    static mut SINGLETON: MaybeUninit<NHReader> = MaybeUninit::uninit();
    static ONCE: Once = Once::new();

    unsafe {
        ONCE.call_once(|| {
            let singleton = NHReader {
                inner: Mutex::new(NetworkHandler::new()),
            };
            SINGLETON.write(singleton);
        });

        SINGLETON.assume_init_ref()
    }
}

// TODO rabbitmq connector
pub struct NetworkHandler {

}

impl NetworkHandler {
    pub fn new() -> Self { Self {  } }
}

