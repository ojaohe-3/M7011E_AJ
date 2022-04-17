use super::node::{Component, SimulationNode};
use std::time::{Instant, Duration};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Manager<'a> {
    maxProduction: f64,
    current: f64,
    ratio: f64,
    price: f64,
    status: bool,
    node: SimulationNode<'a>,
}

impl<'a> Manager<'a> {
    pub fn new(
        maxProduction: f64,
        current: f64,
        ratio: f64,
        price: f64,
        status: bool,
        node: SimulationNode,
    ) -> Self {
        Self {
            maxProduction,
            current,
            ratio,
            price,
            status,
            node,
        }
    }

}

const POWER_ACC: f64 = 0.005;

impl Component for Manager<'_> {
    fn tick(&mut self, time: Instant) -> bool {
        let elps: Duration = self.node.last.elapsed();
        if self.status{
            self.current *= (1 + POWER_ACC) * elps + POWER_ACC * elps;
        }else{
            self.current *= (1 - POWER_ACC) * elps;
        }
        self.current.clamp(0, 1);
        self.node.output = self.current * self.maxProduction;
    }

    fn new(node: SimulationNode) -> Self {
        Manager { maxProduction: 0, current: 0, ratio: 0, price: 0.05, status: false, node: node }
    }
}
