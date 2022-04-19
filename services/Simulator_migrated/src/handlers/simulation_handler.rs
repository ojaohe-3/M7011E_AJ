use std::mem::MaybeUninit;
use std::sync::{Mutex, Once};
use std::time::{Duration, Instant};

use crate::models::manager::Manager;
use crate::models::node::{Component, Grid};
use crate::models::prosumer::{Prosumer, Battery, Turbine};

use super::manager_handler::manager_singleton;
use super::prosumer_handler::prosumer_singleton;

pub struct SHReader {
    pub inner: Mutex<SimulationHandler>,
}

pub fn simulation_singleton() -> &'static SHReader {
    static mut SINGLETON: MaybeUninit<SHReader> = MaybeUninit::uninit();
    static ONCE: Once = Once::new();

    unsafe {
        ONCE.call_once(|| {
            let singleton = SHReader {
                inner: Mutex::new(SimulationHandler::new()),
            };
            SINGLETON.write(singleton);
        });

        SINGLETON.assume_init_ref()
    }
}

pub struct SimulationHandler {
    // grid: Grid,
}

impl SimulationHandler {
    const SIZE: usize = 64; //dotenv
    const LOOP_FREQUENCY: f64 = 100.; //Hz
    pub fn new() -> Self {
        // let grid = Grid::new(SimulationHandler::SIZE, SimulationHandler::SIZE);
        Self {
            // grid
        }
    }

    pub fn process(&self, instance: Instant) {
        let m_s = manager_singleton();
        let p_s = prosumer_singleton();
        // Fixed but still lobotomized goblin
        m_s.inner
            .lock()
            .unwrap()
            .get_all()
            .iter_mut()
            .for_each(|v| v.tick(instance.elapsed().as_secs_f64()));
        p_s.inner
            .lock()
            .unwrap()
            .get_all()
            .iter_mut()
            .for_each(|v| v.tick(instance.elapsed().as_secs_f64()));
    }
}

#[test]
fn test_simulation_mutability() {
    let sim = simulation_singleton();
    let man = manager_singleton();
    let pro = prosumer_singleton();
    let instant = Instant::now();
    
    assert_eq!(man.inner.lock().unwrap().get_all().len(),0);
    assert_eq!(pro.inner.lock().unwrap().get_all().len(),0);

    man.inner.lock().unwrap().add_manager(&Manager::new("1".to_string(), 1000.0, 0., 0.5, 1., true));    
    pro.inner.lock().unwrap().add_prosumer(&Prosumer::new(true, vec![Battery::new(1000., 0., 100., 100.)], vec![Turbine::new(2000.)], 1., 0., "1".to_string()));    
   
    assert_eq!(man.inner.lock().unwrap().get_all().len(),1);
    assert_eq!(pro.inner.lock().unwrap().get_all().len(),1);

    let m_c = man.inner.lock().unwrap().get_manager(&("1".to_string())).unwrap().current;
    // let p_c = pro.inner.lock().unwrap().get_prosumer("1").unwrap().current

    
    sim.inner.lock().unwrap().process(instant);
    assert_ne!(m_c,man.inner.lock().unwrap().get_manager(&("1".to_string())).unwrap().current);
}
