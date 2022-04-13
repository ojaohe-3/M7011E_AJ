import { randomUUID } from "crypto";
import { IComponent, Asset } from "./node";
export default class DefaultNode implements IComponent{
    tick: (time:number) => void;
    static readonly monitorFreq = 0.1;
    output: number;
    demand: number;
    asset: Asset;
    id: string;
    timeToMonitor: number;
    cost: number;
    supply: () => number;
    network: string;

    constructor(){
        this.output = 0;
        this.demand = 0;
        this.cost = 0;
        this.tick = (time: number) => {};
        this.asset = "empty";
        this.id = randomUUID();
        this.network = "";
        this.timeToMonitor = Date.now() + 10000;
        this.supply = () => this.output - this.demand
    }
}