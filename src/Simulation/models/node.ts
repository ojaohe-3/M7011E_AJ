export interface IComponent{
    tick: (time?: number) => void;
    supply : () => number;
    output: number;    
    demand: number;
    asset: string;
    id: string;

}   

export interface INode{
    x: number;
    y: number;
    child: IComponent;
    tick : (time?: number) => void;
}
export default class Node implements INode{

    x: number;
    y: number;

    child: IComponent;
    tick = (time?: number) => this.child.tick(time);
    
    constructor(x: number, y:number, child? : IComponent){
        this.x = x;
        this.y = y;
        if(child)
            this.child = child;
        else
            this.child = new DefaultNode();
    }
    
    get demand(){
        return this.child.demand;
    }

    get output(){
        return this.child.output;
    }
    
    public isDefault() : boolean {
        return this.child.id === "NaN";
    }
}


export class DefaultNode implements IComponent{
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
