import { randomUUID } from "crypto";
import { Types } from "mongoose";
import { DB } from "../DB-Connector/db-connector";
import { Source, Consumer } from "./node";

export interface ITicket {
    target: string // IComponent id
    price: number
    source: string // IProducer id
    amount: number
}
export interface INetwork {
    id: string
    // connected: INetwork this is a proposed solution for enabeling network to be past a simulation node to other in the cluster.
    tickets: ITicket[]
    name: string
    updatedAt: Date
}


export default class Network implements INetwork {

    // private _network: INetwork;
    private _consumers: Map<string, Consumer>;
    private _suppliers: Map<string, Source>;
    private _remainder_sources: Source[] = [];
    private _remainder_consumers: Consumer[] = [];

    public tickets: ITicket[];
    public name: string;
    public updatedAt: Date;
    public id: string;

    private _netpower: number = 0;

    constructor(network?: INetwork) {
        this._consumers = new Map();
        this._suppliers = new Map();

        if (network) {
            this.tickets = network.tickets;
            this.updatedAt = network.updatedAt;
            this.name = network.name;
            this.id = network.id;
        } else {
            const rid: string = randomUUID();
            this.id = Types.ObjectId.createFromTime(Date.now()).toHexString();
            this.tickets = []
            this.name = 'network-' + rid
            this.updatedAt = new Date()
            this.document();
        }
    }
    //#region getters and setters

    public get netpower(): number {
        return this._netpower;
    }
    public set netpower(value: number) {
        this._netpower = value;
    }
    //#endregion



    public addSuppliers(...sources: Source[]) {
        sources.forEach(s => this._suppliers.set(s.id, s))
    }
    public addConsumers(...consumers: Consumer[]) {
        consumers.forEach(c => this._consumers.set(c.id,c))
    }

    public removeSupplier(s: Source) {
        this._suppliers.delete(s.id);
    }

    public removeConsumer(c: Consumer) {
        this._consumers.delete(c.id);
    }

    public async document() {
        try {
            const body = {
                updatedAt: this.updatedAt,
                _id: this.id,
                name: this.name,
                tickets: this.tickets
            };
            await DB.Models.Network.findByIdAndUpdate(this.id, body, {
                upsert: true,
            }).exec();
        } catch (error) {
            console.log(error);
        }
    }





    public tick(demanders: Consumer[], producers: Source[]): ITicket[] {
        this.addSuppliers(...producers);
        this.addConsumers(...demanders);
        // Add left overs and remove them
        demanders.push(...this._remainder_consumers)
        this._remainder_consumers = [];
        producers.push(...this._remainder_sources)
        this._remainder_sources = [];

        
        let total_demand = 0;
        let total_supply = 0;
        // accumulated supply and demand
        producers.forEach(s => {
            total_demand += s.demand;
            total_supply += s.output;
        });
        demanders.forEach(c => total_demand += c.demand);


        const tickets: ITicket[] = [];

        let consumer = demanders.pop();
        let producer = producers.pop();

        // While we still have a consumer or prosumer left
        while (consumer && producer) {
            // supply the producer first 
            let supply: number = producer.output - producer.demand;
            // tickets infere where the energy was tacken from, it can be from multiple sources
            tickets.push({
                target: producer.id,
                price: 0,
                source: producer.id,
                amount: supply > 0 ? producer.demand : producer.output
            });
            // demander has demand, producer exist and there is supply
            while (consumer !== undefined && producer !== undefined && supply > 0) {
                // take from supply
                let take: number = supply - consumer.demand;

                // if we dont have enough supply to take
                if (take < 0) {
                    supply = 0
                    take = consumer.demand + take
                    consumer.cost += take * producer.price;

                } else {
                    // otherwise supply demander with all.
                    supply -= consumer.demand;
                    consumer.cost += take * producer.price;
                    consumer = demanders.pop();
                }

                tickets.push({
                    target: consumer!.id,
                    price: take * producer.price,
                    source: producer.id,
                    amount: take
                });

            }
            producer = producers.pop();

        }

        // If we have left over add them over
        if(consumer){
            this._remainder_consumers.push(consumer, ...demanders)
        }else if(producer){
            this._remainder_sources.push(producer, ...producers)
        }

        this._netpower += total_supply - total_demand;

        this.updatedAt = new Date();
        this.tickets.push(...tickets);
        this.document();
        return tickets;
    }
    public async clear_tickets(){
        this.tickets = [];
        await this.document();
    }

    public toJson(){
        return {
            tickets: this.tickets,
            name: this.name,
        }  
    }
}