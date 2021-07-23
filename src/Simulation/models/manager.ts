import Axios from 'axios';
import { Types } from 'mongoose';
import { DB } from '../DB-Connector/db-connector';
import { IComponent, DefaultNode } from './node';
export default class Manager extends DefaultNode{
    
    current: number;
    maxProduciton: number;
    status: boolean;
    ratio: number;
    price: number;
    
    constructor(id : string, maxProduciton: number){
        super();
        this.demand = 0;
        this.id = id;
        this.current = 0;
        this.price = 0.05;
        this.maxProduciton = maxProduciton;
        this.status = true;
        this.ratio = 1;
        this.asset = "powerplant";


        this.tick = () => {
            if(this.status){
                this.current = this.current <= 0 ? 1 : this.current;
                if(this.maxProduciton*this.ratio > this.current)
                    this.current *= 1.05;
                else
                    this.current *= 0.95;
            }else{
                this.current *= 0.95;
                this.current = this.current < 1.0 ? 0 : this.current;
            }

            this.output = this.current;

        }

    }
    async document() {
        const body = {
            current: this.current,
            maxProduciton: this.maxProduciton,
            status: this.status,
            ratio: this.ratio,
            price: this.price,
            name: process.env.NAME
        }
        try {
            await DB.Models.Manager!.findByIdAndUpdate(this.id, body , {upsert : true}).exec();
        } catch (error) {
            console.log(error);
        }
        
    }
}