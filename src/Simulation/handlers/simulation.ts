import Grid from '../models/grid';
import Node, { INode } from '../models/node';
import { IComponent } from '../models/node';
import NetworkHandler from './NetworkHandler';

export default class Simulator {

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
        this._grid.tick();
        NetworkHandler.instance.tick();
        // this._grid.balance();

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

