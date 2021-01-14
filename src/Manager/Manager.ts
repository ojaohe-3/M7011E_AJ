import Axios from 'axios';
import { Types } from 'mongoose';
import { DB } from './DB-Connector/db-connector';
export class Manager{
    
    id: String;
    current: number;
    maxProduciton: number;
    status: boolean;
    ratio: number;
    tick: () => Promise<void>;

    
    constructor(id : String, maxProduciton: number){
        this.id = id;
        this.current = 0;
        this.maxProduciton = maxProduciton;
        this.status = true;
        this.ratio = 1;
        this.tick = async () => {
            if(this.status){
                this.current = this.current <= 0 ? 1 : this.current;
                this.current *= 1.05;
                this.current = this.current > this.maxProduciton ? this.maxProduciton : this.current;
            }else{
                this.current *= 0.95;
                this.current = this.current < 1.0 ? 0 : this.current;
            }
            await Axios.put(process.env.SIM + '/api/members/managers/'+this.id,
                {
                    current: this.current,
                    status: this.status
                }
            );
            await this.document();
            setTimeout(this.tick, 1000);
            return;
        }
    }

    async document() {
        const body = {
            current: this.current,
            maxProduciton: this.maxProduciton,
            status: this.status,
            ratio: this.ratio,
            name: process.env.NAME
        }
        try {
            await DB.Models.Manager.findByIdAndUpdate(this.id, body , {upsert : true}).exec();
        } catch (error) {
            console.log(error);
        }
        
    }
}