import Grid from '../models/grid';
import Node, { INode } from '../models/node';
import { IComponent } from '../models/node';
import RabbitHandler, { ITicket } from './RabbitClientHandler';
export default class Simulator {

    private static _instance?: Simulator;
    private _grid: Grid;
    private _working: boolean = false;
    private _update_loop?: NodeJS.Timer | undefined;
    

    public static get instance() {
        return this._instance ? this._instance : new Simulator();
    }

    constructor() {
        this._grid = new Grid();
        this.setProcessLoop()
        RabbitHandler.instance.on("receive_rpc", (args)=>{
            const tickets = args?.content;
            if(tickets)
                this._consume_tickets(tickets);
        })

    }

    /**
     * This makes sure we dont generate an infinte stack when we are working overtime
     * it will eventually continue to run
     */
    public setProcessLoop(){
        const sim = Simulator._instance!
        console.log("process stall!")
        if(sim._update_loop){
            clearInterval(sim._update_loop);
        }
        if(sim._working === false){
            sim._update_loop = setInterval(sim.process, 1000);
        }else{
            setTimeout(sim.setProcessLoop, 1000);
        }
    }

    /**
     * 
     */
     public async process() : Promise<void>{

        const sim = Simulator._instance!
        // note that this will change context when in a setInterval loop
        if(sim._working === false){
            sim._working = true;
            if(process.env.NODE_ENV === 'development'){
                console.log("tick")
            }
            sim._grid.tick();
            sim._working = false;
        }else{
            sim.setProcessLoop()
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

