import  Battery  from "./Battery";
import  Turbine  from "./Turbine";
import { IBattery, ITurbine } from "./DB-Connector/prosumer";
import { DB } from "./DB-Connector/db-connector";
import { Types } from "mongoose";
import { Weather } from "./weather";
import Axios from 'axios';
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
    update: () => Promise<void>;

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
        this.output_ratio = 1;
        this.status = true;


        if(id)
            this.id = id;
        else
            this.id = Types.ObjectId().toHexString();

        
        this.update = async ()=> {
            this.totalProduction = 0;
            if(this.status){
                this.turbines.forEach((turbine) => this.totalProduction += turbine.profile(Weather.getInstance().speed));
                this.batteries.forEach((b) => {
                    const tot = this.totalProduction;
                    this.totalProduction -= b.Input(tot*(this.input_ratio/this.batteries.length)); //distribute input equally among all batteries
                    this.totalProduction += b.Output(1)*this.output_ratio;
                });
                this.totalProduction;
    
               
            }
            else{
                const reactivate = () => this.status = true;
                setTimeout(reactivate, 600000);//crude
                console.log(`unactive will reactivate in ca 10 min`);
    
            }
            await this.document();
            const capacity = this.currentCapacity();
            await Axios.put(process.env.SIM + "/api/members/prosumers/"+this.id, //todo caching
            {
                currentCapacity: capacity,
                totalProduction: this.totalProduction, 
                status: this.status
            }
        );
        };
        setInterval(this.update, 60000);
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
