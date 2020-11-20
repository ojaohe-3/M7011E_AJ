import { Battery } from "./Battery";
import { Turbine } from "./Turbine";

export class Procumer{    
    totalProduction: number;
    totalCapacity: number;
    batteries: Array<Battery>;
    turbines: Array<Turbine>;

    constructor(batteries: Array<Battery>, turbines: Array<Turbine>){
        this.totalProduction = 0;
        this.totalCapacity = 0;
    }
}
