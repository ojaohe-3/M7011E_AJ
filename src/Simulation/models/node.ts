export interface IComponent{
    tick: () => void;
    output: number;    
    demand: number;
    // price: number;
    
}   

//TODO this need revison

export default class Node{
    x: number;
    y: number;
    
    child: IComponent;

    tick = () => this.child.tick();
    
    constructor(child : IComponent){
        this.child = child;
    }
    
    get demand(){
        return this.child.demand;
    }

    get output(){
        return this.child.output;
    }
    
}


export class DefaultNode implements IComponent{
    tick: () => void;
    
    output: number;
    demand: number;
    
    constructor(){
        this.output = 0;
        this.demand = 0;
        this.tick = () => {};
    }
}


export class SinkNode implements IComponent{
    tick: () => void;
    
    output: number;
    demand: number;
    standing_demand: number;
    standing_output: number;

    constructor(){
        this.output = 0;
        this.demand = 0;
        this.standing_demand = 0;
        this.standing_output = 0;
        this.tick = () => {
            this.standing_output = this.output
            this.standing_demand = this.demand

            this.output = 0;
            this.demand = 0;
        };
    }
}