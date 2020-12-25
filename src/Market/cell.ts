import { Types } from 'mongoose';
import {DB} from './DB-Connector/db-connector'
const axios = require('axios');

export interface Stats{
    totalProduction: number;
    totalDemand: number;
}
export class Cell{
    destination: String;

    constructor(destion: String){  
        this.destination = destion;
    }

    

    async getStats(): Promise<Stats>{
        let stat: Stats = {totalProduction: 0, totalDemand: 0}
        try {
            
            const req  = await axios.get(this.destination +"/api/data");
            const data  = req.data;
            stat.totalDemand += data.totalDemand;
            stat.totalProduction += data.totalProduction;
            
           
            return stat;   
        } catch (error) {
            console.log(error)
        }
             
    }

    
}