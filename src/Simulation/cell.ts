import { Consumer } from "./consumer";
import { Manager } from "./manager";
import { Procumer } from "./procumer";
export interface Position{
    lat : number;
    lon : number;
}
export class Cell{
    id: String;
    name: String;
    // display_data: String; //placeholder
    destination: String;
    pos : Position;

    

    constructor(id: String, name: String, position: Position, dest: String){
        this.name = name;
        this.id = id;   
        this.pos = position;
        this.destination = dest;

    }



    async getSupply(): Promise<number>{
        const req  = await fetch(this.destination +"/api/totalProduction");
        const data  = await req.json();
        if(Object.keys(data).some(v => "data"))
            return data.data;
        return 0;
    }
    async getDemand(): Promise<number>{
        const req  = await fetch(this.destination +"/api/totalConsumption");
        const data  = await req.json();
        if(Object.keys(data).some(v => "data"))
            return data.data;
        return 0;
        
    }
}