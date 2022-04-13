
export interface Node {
    output: number;
    demand: number;
    // cost?: number;
    id: string;

}

export interface Source extends Node {
    price: number;
}
export type Consumer = Omit<Node, 'output'>
