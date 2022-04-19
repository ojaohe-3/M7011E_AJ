use serde::{Deserialize, Serialize};

use super::node::{Asset, Component};
use std::{
    borrow::BorrowMut,
    time::{Duration, Instant},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manager {
    pub id: String,
    pub max_production: f64,
    pub current: f64,
    pub ratio: f64,
    pub price: f64,
    pub status: bool,
    pub last: f64,
}

impl Manager {
    const STEP_PER_SECOND: f64 = 5.;

    pub fn new(id:String, max_production: f64, current: f64, ratio: f64, price: f64, status: bool) -> Self {
        Self {
            id,
            max_production,
            current,
            ratio,
            price,
            status,
            last: 0.,
        }
    }

    pub fn output(&self) -> f64 {
        self.current * self.max_production
    }

    /// Set the manager's current.
    pub fn set_current(&mut self, current: f64) {
        self.current = current;
    }
}

impl Component<Manager> for Manager {
    fn tick(&mut self, elapsed: f64){
        let mut cur = self.current;
        if self.status {
            cur += Manager::STEP_PER_SECOND * elapsed;
        } else {
            cur -= Manager::STEP_PER_SECOND * elapsed;
        }
        cur = cur.clamp(0., self.ratio); // TODO make ratio the goal rather than status
        self.set_current(cur);
        
    }

    fn get_asset(&self) -> Asset {
        Asset::Powerplant
    }

    fn new(obj: Manager) -> Self {
        obj
    }
}
#[test]
fn test_manager() {
    let m = Manager::new("".to_string(),1000., 0., 0., 0.05, true);
    let manager: &mut Manager = &mut Component::new(m);

    assert!(manager.status);
    assert_eq!(manager.output(), 0.);

    manager.tick(1.);
    manager.tick(1000.);
    assert_eq!(manager.output(), 0.);
    manager.ratio = 1.;
    manager.tick(1.);
    assert!(manager.output() > 0.);
    manager.tick(1000.);
    assert_eq!(manager.output(), manager.max_production);
    manager.status = false;
    manager.tick(0.1);
    assert!(manager.output() < manager.max_production);

}
