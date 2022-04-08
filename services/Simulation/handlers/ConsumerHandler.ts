import { DB } from "../DB-Connector/db-connector";
import Consumer  from "../models/consumer";

export default class ConsumerHandler{

    private static _instance?: ConsumerHandler;
    private _consumers: Map<string, Consumer>;

    public static get instance() {
        return this._instance ? this._instance : new ConsumerHandler();
    }

    constructor(){
        this._consumers = new Map<string, Consumer>();
    }

    public getConsumer(id: string): Consumer | undefined{
        return this._consumers.get(id);
    }
    public addConsumer(consumer: Consumer){
        this._consumers.set(consumer.id,  consumer);
    }

    public async fetchAll(){
        const data = await DB.Models.Consumer!.find({ name: process.env.NAME }).exec();
        data.forEach((e: any) => {
            this.addConsumer(new Consumer(e.id, e.timefn, e.demand, e.profile))
        })
    }	
    
    public getConsumers(): Consumer[] {
        return Array.from(this._consumers.values());
	}
}