
export type CellType = "Empty" | "Conusmer" | "Prosumer" | "Manager"
export interface Cell{
    id: String,
    cell_type: CellType,
}
export type NodeGrid = Node[][]
export default interface SimulationData{
    id?: String
    width: number
    height:number
    nodes: NodeGrid,
}