import  Battery, {IBattery}  from "./battery";
import  Turbine, {ITurbine}  from "./turbine";
import { Types } from "mongoose";
import { Weather } from "../weather";
import { IBattery as IBatteryDocument, ITurbine as ITurbineDocument } from '../DB-Connector/prosumer';
import { DB } from "../DB-Connector/db-connector";
import { IComponent, IProducer } from './node';
import { Consumer } from "./consumer";
import DataMonitor from "../handlers/DataMonitor";


export interface IProcumer{
    batteries: Array<IBattery>;
    turbines: Array<ITurbine>;
    id : string;
}
export class Procumer extends Consumer implements IComponent, IProcumer, IProducer{    
    price: number;
    totalProduction: number;
    totalCapacity: number;
    status: boolean;
    batteries: Battery[];
    turbines: Turbine[];
    input_ratio: number
    output_ratio: number;
    asset: string;    
    currentCapacity: () => number;
    tick: (time:number) => void; 
    timeout: number;

    
    constructor(batteries: Array<Battery>, turbines: Array<Turbine>, id? : string, price?: number){
        super(id ? id : Types.ObjectId().toHexString(), Consumer.generateTimeFn());
        this.asset = "windturbine";
        this.batteries = batteries;
        this.turbines = turbines;
        this.totalProduction = 0;
        this.totalCapacity = 0;
        this.timeout = Date.now();
        this.price = price ? price : 0.15;
        batteries.forEach((e)=> this.totalCapacity += e.capacity)

        this.currentCapacity = () : number=> {
            let sum = 0;
            batteries.forEach((e)=>sum+=e.current);
            return sum;
        };

        
        this.input_ratio = 0.5;
        this.output_ratio = 1;
        this.status = true;
        
        this.tick =  (time: number)=> { //TODO look over and fix
            this.totalProduction = 0;
            if(this.status && time! > this.timeout){
                this.turbines.forEach((turbine) => this.totalProduction += turbine.profile(Weather.Instance.speed));
                this.batteries.forEach((b) => {
                    //through testing there is some oversigt here, but where and what is it?
                    this.totalProduction -= b.Input(this.totalProduction*(this.input_ratio/this.batteries.length)); //distribute input equally among all batteries
                    this.totalProduction += b.Output(this.output_ratio);
                });
                this.output = this.totalProduction;
            }else if(time! > this.timeout){ 
                this.status = true;
            }
            this.totalCapacity = this.currentCapacity();  //what to do 
            if(this.timeToMonitor < time){
                this.timeToMonitor = time + 10000;
                DataMonitor.instance.status(this as IComponent);
            }  
        };
    }
    dissable(){
        this.status = false;
        this.timeout = Date.now() + 600*1000;
    }
    
    async document() {
        const bc: IBatteryDocument[] = [];
        const tc :ITurbineDocument[]= [];
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
