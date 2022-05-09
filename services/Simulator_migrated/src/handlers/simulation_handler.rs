use std::collections::HashSet;
use std::mem::MaybeUninit;
use std::sync::Once;
// use std::sync::{Mutex, Once, Arc};
use std::time::{Duration, Instant};

use futures::lock::Mutex;
use tokio::sync::broadcast::{channel, Sender};

use crate::handlers::weather_handler::weather_singleton;
use crate::models::consumer::Consumer;
use crate::models::manager::Manager;
use crate::models::node::{Node, Grid};
use crate::models::prosumer::{Battery, Prosumer, Turbine};

use super::data_handler::{ConsumerReport, DataHandler, ManagerReport, ProsumerReport};
use super::network_handler::{SendFormat, KeyTypes};
use super::weather_handler::{WeatherHandler, WeatherReport};

pub struct SHReader {
    pub inner: Mutex<SimulationHandler>,
}

// //TODO: move to arc::mutex in shared app data
// pub fn simulation_singleton() -> &'static SHReader {
//     static mut SINGLETON: MaybeUninit<SHReader> = MaybeUninit::uninit();
//     static ONCE: Once = Once::new();

//     unsafe {
//         ONCE.call_once(|| {
//             let singleton = SHReader {
//                 inner: Mutex::new(SimulationHandler::new()),
//             };
//             SINGLETON.write(singleton);
//         });

//         SINGLETON.assume_init_ref()
//     }
// }

#[derive(Debug)]
pub struct SimulationHandler {
    pub grid: Grid,
    pub managers: Vec<Manager>,
    pub prosumers: Vec<Prosumer>,
    pub data_handler: DataHandler,
    pub weather_handler: WeatherHandler,
    pub consumers: Vec<Consumer>,
    // pub tx: Sender<u32>,
    // rx: Receiver<u32>,
    pub total_time: Instant,
    pub last_inter: Instant,
}

impl SimulationHandler {
    pub const SIZE: usize = 64; //dotenv
    pub const LOOP_FREQUENCY: f64 = 10.; //Hz
    pub const FETCH_REQUENCY: Duration = Duration::from_secs(1000);
    pub fn new() -> Self {
        // let (tx, _) = channel(100);
        let grid = Grid::new(SimulationHandler::SIZE, SimulationHandler::SIZE);

        let data_handler = DataHandler::new();
        let weather_handler = WeatherHandler::new();
        Self {
            grid,
            managers: Vec::new(),
            prosumers: Vec::new(),
            data_handler,
            weather_handler,
            consumers: Vec::new(),
            total_time: Instant::now(), 
            last_inter: Instant::now()

        }
    }

    pub async fn process(&mut self, instance: Instant) {
        let mut total_demand = 0.;

        if let Some(report) = self.weather_handler.cache {
            self.consumers.iter_mut().for_each(|c| {
                c.tick(instance.elapsed().as_secs_f64(), report);
                total_demand += c.demand;
            });
            self.prosumers.iter_mut().for_each(|p| {
                p.tick(instance.elapsed().as_secs_f64(), report);
                total_demand += p.demand;
                self.data_handler.log_prosumer(ProsumerReport::new(
                    p.id.to_string(),
                    p.total_production,
                    p.total_stored,
                    p.demand,
                    self.total_time.elapsed().as_secs_f64(),
                ));

                self.managers.iter_mut().for_each(|m| {
                    m.tick(instance.elapsed().as_secs_f64(), report);
                    self.data_handler.log_manager(ManagerReport::new(
                        m.id.to_string(),
                        m.output(),
                        self.total_time.elapsed().as_secs_f64(),
                        m.ratio,
                    ));
                });
            });
        }

        self.data_handler.log_consumer(ConsumerReport::new(
            total_demand,
            self.total_time.elapsed().as_secs_f64(),
        ));
        self.data_handler.check_status().await;
    }

    pub fn add_manager(&mut self, manager: Manager) {
        self.managers.push(manager);
    }

    pub fn add_prosumer(&mut self, prosumer: Prosumer) {
        self.prosumers.push(prosumer);
    }

    pub fn add_consumer(&mut self, consumer: Consumer) {
        self.consumers.push(consumer);
    }

    pub fn get_manager(&self, id: &String) -> Option<&Manager> {
        self.managers.iter().find(|m| (*m).id.eq(id))
    }
    pub fn get_prosumer(&self, id: &String) -> Option<&Prosumer> {
        self.prosumers.iter().find(|p| (*p).id.eq(id))
    }

    pub fn get_manager_mut(&mut self, id: &String) -> Option<&mut Manager> {
        self.managers.iter_mut().find(|m| (*m).id.eq(id))
    }
    pub fn get_prosumer_mut(&mut self, id: &String) -> Option<&mut Prosumer> {
        self.prosumers.iter_mut().find(|p| (*p).id.eq(id))
    }

    pub fn get_consumer(&self, id: &String) -> Option<&Consumer> {
        self.consumers.iter().find(|c| (*c).id.eq(id))
    }

    pub fn get_consumer_mut(&mut self, id: &String) -> Option<&mut Consumer> {
        self.consumers.iter_mut().find(|p| (*p).id.eq(id))
    }

    pub async fn fetch_weather(&mut self){
        let result = match WeatherHandler::fetch_report().await{
            Ok(v) => v,
            Err(_) => {
                println!("not able to fetch weather report defaulting to generic"); 
                WeatherReport{temp: 273.15, wind_speed: 4.}
            },
        };
        self.weather_handler.cache = Some(result);
    }

    fn generate_sendform_consumers(&self) -> Vec<(String, SendFormat)>{
        let mut res = Vec::new();
        for c in self.consumers{
           let format = SendFormat::new(KeyTypes::Consumer, c.demand, c.id, None, None);
           res.push((c.network, format));
        }
        
        res
    }
    fn generate_sendform_prosumers(&self) -> Vec<(String, SendFormat)>{
        let mut res = Vec::new();
        for p in self.prosumers{
           let format = SendFormat::new(KeyTypes::Consumer, p.total_production, p.id, Some(0.05), Some(p.demand));
           res.push((p.network, format));
        }
        
        res
    }
    fn generate_sendform_managers(&self) -> Vec<(String, SendFormat)>{
        let mut res = Vec::new();
        for m in self.managers{
           let format = SendFormat::new(KeyTypes::Consumer, m.output() , m.id, Some(m.price), None);
           res.push((m.network, format));
        }
        
        res
    }
    pub fn generate_sendforms(&self) -> Vec<(String, SendFormat)>{
        let mut c = self.generate_sendform_consumers();
        let p = self.generate_sendform_prosumers();
        let m = self.generate_sendform_managers();

        c.append(&mut p);
        c.append(&mut m);
        c
    }

}

#[tokio::test]
async fn test_simulation() {
    let mut sim = SimulationHandler::new();
    let instant = Instant::now();

    assert_eq!(sim.prosumers.len(), 0);
    assert_eq!(sim.managers.len(), 0);

    sim.add_manager(Manager::new(
        "1".to_string(),
        1000.0,
        0.,
        0.5,
        1.,
        true,
        format!(""),
    ));
    sim.add_prosumer(Prosumer::new(
        true,
        vec![Battery::new(1000., 0., 100., 100.)],
        vec![Turbine::new(2000.)],
        1.,
        0.,
        "1".to_string(),
        0.,
        format!(""),
    ));

    assert_eq!(sim.prosumers.len(), 1);
    assert_eq!(sim.managers.len(), 1);

    let m_c = sim.get_manager(&("1".to_string())).unwrap().current;
    // let p_c = pro.inner.lock().unwrap().get_prosumer("1").unwrap().current

    sim.process(instant).await;
    assert_ne!(m_c, sim.get_manager(&("1".to_string())).unwrap().current);

    assert!(sim.data_handler.manager_reports.len() > 0);
    assert!(sim.data_handler.prosumer_reports.len() > 0);
    assert!(sim.data_handler.consumer_reports.len() > 0);
}
#[tokio::test]
async fn test_loop() {
    let mut time = Instant::now();
    let mut sim = SimulationHandler::new();

    sim.add_manager(Manager::new(
        "1".to_string(),
        1000.0,
        0.,
        1.,
        1.,
        true,
        format!(""),
    ));
    sim.add_prosumer(Prosumer::new(
        true,
        vec![Battery::new(1000., 0., 100., 100.)],
        vec![Turbine::new(2000.)],
        1.,
        0.,
        "1".to_string(),
        0.,
        format!(""),
    ));
    let ws = weather_singleton(); // FIXME: This should be removed and replaced as an inner
    ws.inner.lock().unwrap().set_cache(WeatherReport {
        temp: 273.,
        wind_speed: 12.8,
    });

    for i in 0..2300 {
        tokio::time::sleep(Duration::from_secs_f64(
            1. / SimulationHandler::LOOP_FREQUENCY,
        ))
        .await;
        sim.process(time).await;
        println!(
            "[{}]{}:ouput: {}",
            i,
            time.elapsed().as_secs_f64(),
            sim.managers[0].output()
        );
        let p = &sim.prosumers[0];
        println!(
            "[{}]{}:produced: {} stored: {}",
            i,
            time.elapsed().as_secs_f64(),
            p.total_production,
            p.total_stored
        );
        time = Instant::now()
    }
}
