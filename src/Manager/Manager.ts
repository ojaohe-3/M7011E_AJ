import { DB } from '../DB-Connector/db-connector';
import {ManagerSchema} from './../DB-Connector/manager';
export class Manager{
    
    id: String;
    current: number;
    maxProduciton: number;
    production : number;
    status: boolean;
    ratio: number;
    
    constructor(id : String, maxProduciton: number){
        this.id = id;
        this.current = 0;
        this.maxProduciton = maxProduciton;
        const acceleration = 1.5;
        this.production = 0;
        this.status = false;
        this.ratio = 1;

    }

    setActive(){
        this.status = true;
        this.Produce(1.05);
    }
    stop(){
        this.status = false;
        if(this.production !== 0)
            this.Produce(0.95);
    }

    /**
     * start production
     * returns a promise, does only really return max or min
     * @param speed t0
     */
    async Produce(acceleration : number){
        this.production += this.production*acceleration; //updates value
        await new Promise(resolve => setTimeout(resolve, 250));  //wait 250ms
        
        //if we are producing i.e accelerating
        if(this.status){
            if(this.production >= this.maxProduciton*this.ratio)
                if(this.production - this.maxProduciton < 5)
                    return this.maxProduciton*this.ratio;
                else
                    acceleration = 2- acceleration;// this should occur every time we change the ratio while produciton is running
        }
        //if we are de accelerating
        if(!this.status)
        {
            if(this.production < 1)
            {
                return 0;
            }
            if(acceleration > 1){
                acceleration = 2- acceleration;
            }
        }        
        return this.Produce(acceleration)
    }

    async document() {
        const body = {
            current: this.current,
            maxProduciton: this.maxProduciton,
            production : this.production,
            status: this.status,
            ratio: this.ratio,
            name: process.env.NAME,
        }
        await DB.Models.Manager.findByIdAndUpdate(this.id, body, {upsert : true}).exec();
    }
}