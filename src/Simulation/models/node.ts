import DefaultNode from "./defaultnode";

export interface IComponent{
    tick: (time: number) => void;
    output: number;    
    demand: number;
    asset: string;
    id: string;

}   

export interface IProducer extends IComponent{
    price: number;
}

export interface INode{
    x: number;
    y: number;
    child: IComponent;
}
export default class Node implements INode{

    x: number;
    y: number;
    gid: string;

    child: IComponent;
    tick = (time: number) => this.child.tick(time);
    
    constructor(gid: string, x: number, y:number, child? : IComponent){
        this.gid = gid;
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
        return this.child.id === "Null";
    }
    public async document(){
        const body = {
            x: this.x,
            y: this.y,
            child: this.child,
            gid: this.gid
        }
    }
}



