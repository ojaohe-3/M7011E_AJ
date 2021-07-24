import { IComponent } from "./node";

export default class DefaultNode implements IComponent{
    tick: () => void;
    
    output: number;
    demand: number;
    asset: string;
    id: string;
    supply: () => number;

    constructor(){
        this.output = 0;
        this.demand = 0;
        this.tick = () => {};
        this.asset = "empty";
        this.id = "NaN"
        this.supply = () => this.output - this.demand
    }
}