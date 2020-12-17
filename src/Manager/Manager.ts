import Axios from 'axios';
import { Types } from 'mongoose';
import { DB } from './DB-Connector/db-connector';
export class Manager{
    
    id: String;
    current: number;
    maxProduciton: number;
    status: boolean;
    ratio: number;
    
    constructor(id : String, maxProduciton: number){
        this.id = id;
        this.current = 0;
        this.maxProduciton = maxProduciton;
        this.status = true;
        this.ratio = 1;

    }

    setActive(){
        this.status = true;
        this.Produce(1.1);
    }
    stop(){
        this.status = false;
        if(this.current !== 0)
            this.Produce(0.95);
    }
    async tick(){
        await Axios.put(process.env.SIM + '/api/members/managers/'+this.id,
            {
                current: this.current,
                status: this.status
            }
        );
    }
    /**
     * start production
     * returns a promise, does only really return max or min
     * @param speed t0
     */
    async Produce(acceleration : number){
        if(this.current == 0 && this.status)
            this.current = 0.1;

        let a = acceleration;
        if( a > 1 && !this.status){
            a =  a +  (1 - a*1.1);
        }else if( a < 1 && this.status)
            a += 1;

        this.current *= a; //updates value
        await new Promise(resolve => setTimeout(resolve, 1000));  //wait 1s
        await this.tick();
        
        //if we are producing i.e accelerating
        if(this.status){
            if(this.current >= this.maxProduciton*this.ratio){
                this.current = this.maxProduciton*this.ratio;
                return this.maxProduciton*this.ratio;
            
            }
                
        }
        //if we are de accelerating
        if(!this.status)
        {
            if(this.current < 1)
            {   
                this.current = 0;
                return 0;
            }
            
        }        
        return this.Produce(a)
    }

    async document() {
        const body = {
            current: this.current,
            maxProduciton: this.maxProduciton,
            status: this.status,
            ratio: this.ratio,
            name: process.env.NAME,
            _id: Types.ObjectId(+this.id)
        }
        try {
            const entry = await DB.Models.Manager.findById(Types.ObjectId(+this.id)).exec();
            if(!entry)
                await DB.Models.Manager.create(body);
            else
                await DB.Models.Manager.findByIdAndUpdate(this.id, body , {upsert : true}).exec();
        } catch (error) {
            console.log(error);
        }
        
    }
}