import {DB} from './../DB-Connector/db-connector'
export interface Stats{
    totalProduction: number;
    totalDemand: number;
}
export class Cell{
    id: String;
    destinations: String[];
    

    constructor(id: String,  destions: String[]){
        this.id = id;   
        this.destinations = destions;
    }

    

    async getStats(): Promise<Stats>{
        let stat: Stats = {totalProduction: 0, totalDemand: 0}
        try {
            await Promise.all(this.destinations.map(async dest =>{
                const req  = await fetch(dest +"/api/stats");
                const data  = await req.json();
                stat.totalDemand += data.totalDemand;
                stat.totalProduction += data.totalProduction;
            }));
           
            return stat;   
        } catch (error) {
            //handle connection error
        }
             
    }

    async document(){
        const body = {
            name: process.env.NAME,
            cells: this.destinations
        };
        await DB.Models.Market.findByIdAndUpdate(this.id, body, {upsert : true}).exec();
    }
}