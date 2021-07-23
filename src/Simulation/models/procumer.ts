import  Battery  from "./battery";
import  Turbine  from "./turbine";
import { Types } from "mongoose";
import Axios from 'axios';
import { Weather } from "../weather";
import { IBattery, ITurbine } from "../DB-Connector/prosumer";
import { DB } from "../DB-Connector/db-connector";
import { IComponent } from './node';
import { Consumer } from "./consumer";
export class Procumer extends Consumer implements IComponent{    
    totalProduction: number;
    totalCapacity: number;
    status: boolean;
    batteries: Battery[];
    turbines: Turbine[];
    input_ratio: number
    output_ratio: number;
    asset: string;    
    currentCapacity: () => number;
    tick: (time?:number) => void; 
    timeout: number;
    
    constructor(batteries: Array<Battery>, turbines: Array<Turbine>, id? : string){
        super(id ? id : Types.ObjectId().toHexString(), Consumer.generateTimeFn());
        this.asset = "windmill";
        this.batteries = batteries;
        this.turbines = turbines;
        this.totalProduction = 0;
        this.totalCapacity = 0;
        this.timeout = Date.now();

        batteries.forEach((e)=> this.totalCapacity += e.capacity)

        this.currentCapacity = () : number=> {
            let sum = 0;
            batteries.forEach((e)=>sum+=e.current);
            return sum;
        };

        this.input_ratio = 0.5;
        this.output_ratio = 1;
        this.status = true;
        
        this.tick =  (time?: number)=> {
            this.totalProduction = 0;
            if(this.status && time! > this.timeout){
                this.turbines.forEach((turbine) => this.totalProduction += turbine.profile(Weather.Instance.speed));
                this.batteries.forEach((b) => {
                    this.totalProduction -= b.Input(this.totalProduction*(this.input_ratio/this.batteries.length)); //distribute input equally among all batteries
                    this.totalProduction += b.Output(this.output_ratio);
                });
                this.totalProduction;
            }else if(time! > this.timeout){ 
                this.status = true;
            }
            const capacity = this.currentCapacity();           
        };
    }
    dissable(){
        this.status = false;
        this.timeout = Date.now() + 600*1000;
    }
    
    async document() {
        const bc: IBattery[] = [];
        const tc :ITurbine[]= [];
        this.batteries.forEach(battery => bc.push({capacity: battery.capacity, current: battery.current, maxOutput: battery.maxOutput,maxCharge:  battery.maxCharge}));
        this.turbines.forEach(turbine => tc.push({maxPower: turbine.maxPower}));
       
        try {  
            const capacity = this.currentCapacity();
            const body= {
                totalProduction: this.totalProduction,
                totalCapacity: this.totalCapacity,
                currentCapacity: capacity,
                batteries: bc,
                turbines: tc,
                name: process.env.NAME,
                status: this.status
            };
            await DB.Models.Prosumer.findByIdAndUpdate(this.id, body , {upsert : true}).exec();
            
            
        }catch (error) {
            console.log(error)
        }
    }
}
