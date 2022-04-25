use serde::{Deserialize, Serialize};
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
pub enum CellType {
    Empty,
    Conusmer,
    Prosumer,
    Manager,
}

pub trait Component<T> {
    fn new(obj : T) -> Self;
    fn tick(&mut self, elapsed: f64);
    fn get_asset(&self) -> Asset;
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Cell {
    x: usize,
    y: usize,
    id: String,
    cell_type: CellType,
}

impl Cell {
    pub fn new(x: usize, y: usize, id: String, cell_type: CellType) -> Self {
        Self {
            x,
            y,
            id,
            cell_type,
        }
    }
}

pub type NodeGrid = Vec<Vec<Cell>>;
#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct Grid {
    width: usize,
    height: usize,
    id: String,
    nodes: NodeGrid,
}

impl Grid {
    pub fn new(width: usize, height: usize) -> Self {
        use uuid::Uuid;
        let id = &Uuid::new_v4().to_string();
        let mut grid: NodeGrid = Vec::new();

        for j in 0..height {
            let mut row = Vec::new();
            for i in 0..width {
                row.push(Cell {
                    x: i,
                    y: j,
                    id: "none".to_string(),
                    cell_type: CellType::Empty,
                });
            }
            grid.push(row);
        }

        Self {
            width,
            height,
            id: id.to_string(),
            nodes: grid,
        }
    }
    pub fn get_at(&self, x: usize, y: usize) -> Result<Cell, ()> {
        if x > self.width || y > self.height {
            return Err(());
        }
        Ok(self.nodes[y][x].clone())
    }

    pub fn set_at(&mut self, x: usize, y: usize, item: Cell) {
        self.nodes[y][x] = item;
    }
}

