import Grid from '../models/grid';
import Node, { INode } from '../models/node';
import { IComponent } from '../models/node';
import RabbitHandler, { ITicket } from './RabbitClientHandler';

export default class Simulator {

    private static _instance?: Simulator;
    private _grid: Grid;
    private _working: boolean;
    private _update_loop: NodeJS.Timer;
    

    public static get instance() {
        return this._instance ? this._instance : new Simulator();
    }

    constructor() {
        this._grid = new Grid();
        this._working = false;
        this._update_loop = setInterval(this.process, 1000);
        RabbitHandler.instance.on("receive_rpc", (args)=>{
            const tickets = args?.content;
            if(tickets)
                this._consume_tickets(tickets);
        })

    }

    public process() : void{
        if(!this._working){
            this._working = true;
            this._grid.tick();
        }
        
    }
    private _consume_tickets(tickets: ITicket[]){
        //TODO: Generate Costs and profits to members
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

