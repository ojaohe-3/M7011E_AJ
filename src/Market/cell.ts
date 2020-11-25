import { Consumer } from "../Simulation/consumer";
import { Manager } from "../Simulation/manager";
import { Procumer } from "../Simulation/procumer";

export class Cell{
    id: String;
    name: String;
    destination: String;
    consumers: Map<String, Consumer>;
    proumers: Map<String, Procumer>;
    managers: Map<String, Manager>;
    

    constructor(id: String, name: String, dest: String){
        this.name = name;
        this.id = id;   
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