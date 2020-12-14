import { Battery } from "./Battery";
import { Turbine } from "./Turbine";
import {v4} from 'uuid'
import { IBattery, IProcumer, ITurbine, ProsumerSchema } from "../DB-Connector/prosumer";
import { DB } from "../DB-Connector/db-connector";
export class Procumer{    
    totalProduction: number;
    totalCapacity: number;
    status: boolean;
    batteries: Battery[];
    turbines: Turbine[];
    id: String;
    input_ratio: number
    output_ratio: number;
    currentCapacity: () => number;

    constructor(batteries: Array<Battery>, turbines: Array<Turbine>, id? : String){
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

        if(id)
            this.id = id;
        else
            this.id = v4();
    }
     /**
     * Update simulation profile by accessing tick from weathermodule, speed and ratio necessetates input
     * @param speed 
     * @param ratio 
     */
    tick(speed: number){
        this.totalProduction = 0;
        if(this.status){
            this.turbines.forEach((turbine) => this.totalProduction += turbine.profile(speed));
            this.batteries.forEach((b) => {
                let tot = this.totalProduction;
                this.totalProduction -= b.Input(tot*(this.input_ratio/this.batteries.length)); //distribute input equally among all batteries
                this.totalProduction += b.Output(1);
            });
            this.totalProduction*this.output_ratio;
        }
    }

    async document() {
        const bc: IBattery[] = [];
        const tc :ITurbine[]= [];
        
        this.batteries.forEach(battery => bc.push({capacity: battery.capacity, current: battery.current, maxOutput: battery.maxOutput,maxCharge:  battery.maxCharge}));
        this.turbines.forEach(turbine => tc.push({maxPower: turbine.maxPower}));
        const body= {
            totalProduction: this.totalProduction,
            totalCapacity: this.totalCapacity,
            currentCapacity: this.currentCapacity(),
            batteries: bc,
            turbines: tc,
            name: process.env.NAME,
            status: this.status,
        };

        await DB.Models.Prosumer.findByIdAndUpdate(this.id, body, {upsert : true}).exec();
           
        
    }
}
