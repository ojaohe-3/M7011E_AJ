import axios from "axios";
import  Battery  from "../models/battery";
import { DB } from "../DB-Connector/db-connector";
import { Procumer } from "../models/procumer";
import  Turbine  from "../models/Turbine";

export default class ProsumerHandler{
    /**
     * Handles all members of the simulation, to ease usage on the api modules 
     */
    private procumers: Map<String, Procumer>;
    private static instance : ProsumerHandler;
 
    constructor(){
        this.procumers = new Map<String, Procumer>();
        this.fetchAll(); //async, it will hopefully fill the request before usage, inconsistencys for the first minutes is acceptable
    }

    /**
     * gets members from there id
     * @param id id used for the entry
     */
    public getById(id : String) : Procumer{
        if(this.procumers.has(id)){
            return this.procumers.get(id);
        }else{
            // this in retrospect, it might be a very bad idea to search for db entries if it isn't already loaded. it wouldn't
            // follow the current structure, if it does not exist, it will eventually
            // const item = await DB.Models.Prosumer.findById(id);
            // if (item){

            //     const bs = []
            //     const ts = []
            //     item.batteries.forEach(b => bs.push(new Battery(b.capacity,b.maxOutput, b.maxCharge, b.current)));
            //     item.turbines.forEach(t => ts.push(new Turbine(t.maxPower)));

            //     return new Procumer(bs, ts, id);
            // }
            return undefined;
        }
    }
    /**
     * puts a new item into the prosumer registry.
     * @param id id
     * @param item new item to update/create
     */
    public async put(id: String, item : Procumer) {
        try {
            this.procumers.set(id, item);
            await axios.post(process.env.SIM + '/api/members/prosumers/', {
                body:[
                    {
                        id: id, 
                        timefn: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], //temporary, fix later
                        totalCapacity: item.totalCapacity,
                        totalProduction: item.totalProduction,
                        currentCapacity: item.currentCapacity(), 
                        status: item.status
                    }
                ]});
                await item.update();
        } catch (error) {
            console.log(error);
        }
    }

    public getAll() : Map<String, Procumer>{
        return this.procumers;
    }

    public static get Instance(): ProsumerHandler{
        if(!this.instance){
            this.instance = new ProsumerHandler();
        }
        return this.instance;
    }
    private async fetchAll() {
        const data = await DB.Models.Prosumer.find({name: process.env.NAME}).exec();
        const publisher = [];
        data.forEach(async entry => {
            const bc = [];
            const tc = [];
            entry.batteries.forEach(b=> bc.push(new Battery(b.capacity,b.maxOutput, b.maxCharge, b.current)));
            entry.turbines.forEach(t=>tc.push(new Turbine(t.maxPower)));
         
            const prosumer = new Procumer(bc,tc, entry.id);
            prosumer.status =  true;
            await this.put(entry.id, prosumer);
        });
    
        // console.log(data);
    }
}