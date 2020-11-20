import { Consumer } from "./consumer";
import { Manager } from "./manager";
import { Procumer } from "./procumer";
export interface Position{
    x : number;
    y : number;
}
export class Cell{
    id: String;
    name: String;
    // display_data: String; //placeholder
    consumers: Map<String, Consumer>;
    procumers: Map<String, Procumer>;
    managers: Map<String, Manager>;
    pos! : Position;

    constructor(id: String, name: String){
        this.consumers = new Map<String, Consumer>();
        this.procumers = new Map<String, Procumer>();
        this.name = name;
        this.id = id;   
    }

    getSupply(): number{
        let acc : number = 0;
        this.procumers.forEach(v => acc += v.totalProduction);
        this.managers.forEach(v => v.production);
        return acc;
    }
    getDemand(temp: number): number{
        let acc : number = 0;
        this.procumers.forEach(v => acc += v.consumption(temp));
        this.consumers.forEach(v => v.consumption(temp));
        return acc;
    }
    
}