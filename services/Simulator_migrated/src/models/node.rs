use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum Asset {
    EMPTY,
    Customer1,
    Customer2,
    Customer3,
    Windturbine,
    Powerplant,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct SimulationNode<'a> {
    network: &'a str,
    output: f64,
    demand: f64,
    asset: Asset,
    id: &'a str,
    last: Instant,
}
pub trait Component {
    fn tick(&mut self, time: Instant) -> bool;
    fn new(node: SimulationNode) -> Self;
}

type NodeGrid = Vec<Vec<Option<dyn Component>>>;
pub struct Grid<'a> {
    width: usize,
    height: usize,
    id: &'a str,
    nodes: NodeGrid,
}

impl Grid<'_> {
    fn new(width: usize, height: usize) -> Grid<'static>{
        use uuid::Uuid;
        let id = Uuid::new_v4().ToString();
        let mut grid: NodeGrid = &Vec::new();

        for j in 0..height {
            let mut row = Vec::new();
            for i in 0..width {
                row.push(None);
            }
            grid.push(row);
        }

        Grid {
            width,
            height,
            id,
            nodes: grid,
        }
    }

    fn getAt(&self, x: usize, y: usize) -> Result<dyn Component, ()> {
        if x > self.width || y > self.height {
            return Err(());
        }
        Ok(self.node[y][x])
    }

    fn setAt<T>(&mut self, x: usize, y: usize, item: &dyn Component) {
        self.nodes[y][x].child = Some(*item);
    }

    fn tick(&self) {
        for row in self.nodes {
            for item in row {
                if let Some(child) = item.child {
                    child.tick(Instant::now());
                }
            }
        }
    }
}
