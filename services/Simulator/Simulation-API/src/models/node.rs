use serde::{Deserialize, Serialize};

use crate::handlers::weather_handler::WeatherReport;
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum Asset {
    EMPTY,
    Customer1,
    Customer2,
    Customer3,
    Windturbine,
    Powerplant,
}
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum CellType {
    Empty,
    Conusmer,
    Prosumer,
    Manager,
}



pub trait Node<T> {
    fn new(obj : T) -> Self;
    fn tick(&mut self, elapsed: f64, weather_report: WeatherReport);
    fn get_asset(&self) -> Asset;
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Cell {
    // x: usize,
    // y: usize,
    pub id: String,
    pub cell_type: CellType,
}

impl Cell {
    pub fn new(/*x: usize, y: usize,*/ id: String, cell_type: CellType) -> Self {
        Self {
            // x,
            // y,
            id,
            cell_type,
        }
    }
}

pub type NodeGrid = Vec<Vec<Cell>>;
#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct Grid {
    pub width: usize,
    pub height: usize,
    pub id: String,
    pub nodes: NodeGrid,
}

impl Grid {
    pub fn new(width: usize, height: usize) -> Self {
        use uuid::Uuid;
        let id = &Uuid::new_v4().to_string();
        let mut grid: NodeGrid = Vec::new();

        for _ in 0..height {
            let mut row = Vec::new();
            for _ in 0..width {
                row.push(Cell {
                    // x: i,
                    // y: j,
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

    // pub fn get_all_id(&self, id: &String) -> Vec<Cell>{
    //     let mut temp = Vec::new();
    //     for col in &self.nodes{
    //         for cell in col{
    //             if cell.id.eq(id)
    //             {
    //                 temp.push(cell);
    //             }
    //         }
    //     }
    //     temp.into_iter().cloned().collect()
    // }

    pub fn get_all_type(&self, cell_type: CellType)-> Vec<Cell>{
        let mut temp = Vec::new();
        for col in &self.nodes{
            for cell in col{
                if cell.cell_type.eq(&cell_type){
                    temp.push(cell);
                }
            }
        }
        temp.into_iter().cloned().collect()
    }
}

