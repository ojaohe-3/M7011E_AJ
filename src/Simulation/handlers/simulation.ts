import Node, { DefaultNode } from '../models/node';

export class Simulator {
    private static _instance?: Simulator;

    public static get instance() {
        return this._instance ? this._instance : new Simulator();
    }

    constructor() {

    }

}

export class Grid {
    private _nodes: Node[][]
    width: number
    height: number

    constructor(width?: number, height?: number) {
        this._nodes = [[]];
        this.width = width ? width : 64;
        this.height = height ? height : 64;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this._nodes[y][x] = new Node(new DefaultNode());
            }
        }
    }

    public getAt(x: number, y: number): Node {
        return this._nodes[y][x];
    }

    public setAt(x: number, y: number, value: Node): void {
        this._nodes[y][x] = value;
    }

    public balance() {
        // The rules: 
        // * a node can only move its output to its direct neighboors
        // * a node can only recive output from its neighboors
        // * all nodes moves to equilibrium
        // * a node takes only from the cheapest source if it is available
        

    }

}