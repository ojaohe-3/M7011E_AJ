
export interface Node {
    output: number;
    demand: number;
    // cost?: number;
    id: string;
    time_stamp: number;
    updated: boolean;

}

export interface Source extends Node {
    price: number;
}
export type Consumer = Omit<Node, 'output'>
