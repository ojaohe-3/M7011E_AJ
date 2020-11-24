import { Battery } from "./Battery";
import { Turbine } from "./Turbine";

export class Procumer{    
    totalProduction: number;
    totalCapacity: number;
    status: boolean;
    batteries: Array<Battery>;
    turbines: Array<Turbine>;

    input_ratio: number
    output_ratio: number;
    currentCapacity: () => number;

    constructor(batteries: Array<Battery>, turbines: Array<Turbine>){
        this.batteries = batteries;
        this.turbines = turbines;
        this.totalProduction = 0;
        this.totalCapacity = 0;
        batteries.forEach((e)=> this.totalCapacity += e.capacity)
        this.currentCapacity = () : number=> {
            let sum = 0;
            batteries.forEach((e)=>sum+=e.current);
            return sum;
        };

        this.input_ratio = 0.5;
        this.output_ratio = 0.5;
    }
     /**
     * Update simulation profile by accessing tick from weathermodule, speed and ratio necessetates input
     * @param speed 
     * @param ratio 
     */
    tick(speed: number){
        this.totalProduction = 0;
        this.turbines.forEach((turbine) => this.totalProduction += turbine.profile(speed));
        this.batteries.forEach((b) => {
            let tot = this.totalProduction;
            this.totalProduction -= b.Input(tot*(this.input_ratio/this.batteries.length)); //distribute input equally among all batteries
            this.totalProduction += b.Output(this.output_ratio);
        });
    }
}
