import Node, { DefaultNode, INode } from '../models/node';
import { IComponent } from '../models/node';

export class Simulator {

    private static _instance?: Simulator;
    private _grid: Grid;
    public static get instance() {
        return this._instance ? this._instance : new Simulator();
    }

    constructor() {
        this._grid = new Grid();
        setInterval(this.process, 1000);

    }

    public process() : void{
        
    }


    public getAt(x: number, y: number) : Node | undefined {
        return this._grid.getAt(x,y);
    }
    public getAll():  INode[][] {
        return this._grid.nodes as INode[][];
    }
    //TODO make simulation

    public setAt(x: number, y: number, member :IComponent) {
        const node = this.getAt(x,y);
        if(node)
            node.child = member;
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
                this._nodes[y][x] = new Node(x,y, new DefaultNode());
            }
        }
    }

    public getAt(x: number, y: number): Node | undefined {
        try {
            return this._nodes[y][x];
        } catch (error) {
            console.log('')
        }
    }

    public setAt(x: number, y: number, value: Node): void {
        this._nodes[y][x] = value;
    }

    public balance() {
        // The rules: 
        // * a node takes only from the cheapest source if it is available
        // * a manager on a node can only set the price, production of prosumers sells only as the closest manager
        // * all Nodes must have equal supply as its demand, supply is its output.
    

    }

    public get nodes(){
        return this._nodes;
    }
}