import { Types } from "mongoose";
import { DB } from "../DB-Connector/db-connector";
import { IComponent } from './node';
import { Weather } from '../weather';
import { assert } from "console";

export class Consumer implements IComponent{

    id: String;
    timefn: number[];
    consumption: (temp: number) => number;
    demand : number;
    profile: number;
    tick: () => void;
    output: number;

    constructor(id : String, timefn : number[], demand? : number, profile?: number){
        this.id = id;
        assert(this.timefn.length == 24)
        this.timefn = timefn;
        this.output = 0;
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
        this.demand = demand ? demand : 0;
        this.tick = () => {
            this.demand = this.consumption(Weather.getInstance().temp);
        };

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

    static generateTimeFn(): number[] {
        const random = Math.random();
        return [
            0.02 * random, 0.0114 * random, 0.011 * random,
            0.05 * random, 0.2 * random, 0.35 * random, 
            0.6 * random, 0.8 * random, 0.65 * random, 
            0.64 * random, .56 * random, 0.58 * random, 
            0.74 * random, 0.56 * random, 0.3 * random,
            0.2 * random, 0.812 * random, 0.911 * random,
            0.922 * random, 0.926 * random, 0.845 * random,
            0.76 * random, 0.311 * random, 0.121 * random 
        ]; // profile for each hour of the day
    }
}