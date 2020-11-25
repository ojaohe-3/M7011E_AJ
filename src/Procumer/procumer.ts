import { Battery } from "./Battery";
import { Turbine } from "./Turbine";

export class Procumer{    
    totalProduction: number;
    totalCapacity: number;
    status: boolean;
    batteries: Array<Battery>;
    turbines: Array<Turbine>;

    constructor(batteries: Array<Battery>, turbines: Array<Turbine>){
        this.totalProduction = 0;
        this.totalCapacity = 0;
    }
     /**
     * Update simulation profile by accessing tick from weathermodule, speed and ratio necessetates input
     * @param speed 
     * @param ratio 
     */
    tick(speed: number, in_ratio: number, out_ratio: number){
        this.turbines.forEach((turbine) => this.totalProduction += turbine.profile(speed));
        this.batteries.forEach((b) => {
            let tot = this.totalProduction;
            this.totalProduction -= b.Input(tot*(in_ratio/this.batteries.length)); //distribute input equally among all batteries
            this.totalProduction += b.Output(out_ratio);
        });
    }
}
