import { Consumer } from "../Simulation/consumer";
import { Manager } from "../Simulation/manager";
import { Procumer } from "../Simulation/procumer";
export interface Stats{
    totalProduction: number;
    totalDemand: number;
}
export class Cell{
    id: String;
    name: String;
    destination: String;
    

    constructor(id: String, name: String, dest: String){
        this.name = name;
        this.id = id;   
        this.destination = dest;
    }

    

    async getStats(): Promise<Stats>{
        try {
            const req  = await fetch(this.destination +"/api/stats");
            const data  = await req.json();
            return data;   
        } catch (error) {
            //handle connection error
        }
             
    }
}