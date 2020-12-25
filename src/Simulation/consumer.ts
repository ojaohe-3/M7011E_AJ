import { Types } from "mongoose";
import { DB } from "./DB-Connector/db-connector";

export class Consumer{
    id: String;
    timefn: number[];
    consumption: (temp: number) => number;
    demand : number;
    profile: number;
    constructor(id : String, timefn : number[], demand? : number, profile?: number){
        this.id = id;
        this.timefn = timefn;
        
        if(!profile)
        {const r = Math.random();
            const rd = Math.random();
            const size = r*4- r*2+ rd*2 + 4; //pseudo normal distro random
            const lamba =  r- r/2+ rd/2 + 1;
            this.profile = size*.027 + lamba*0.5;
        }else
            this.profile = profile;

        
        this.consumption = (temp) => {
            return this.profile * (0.002*Math.pow(294.15-temp,2))+timefn[(new Date()).getHours()];
        }
        if(demand)
            this.demand = demand;
        else
            this.demand = 0;
    }

    async document(){
        try {
        
            const body = {
                demand: this.demand,
                timefn: this.timefn,
                profile: this.profile,
                name: process.env.NAME
            }
            await DB.Models.Consumer.findByIdAndUpdate(this.id, body , {upsert : true}).exec();
        
        
        } catch (error) {
            console.log(error)
        }
           

    }
}