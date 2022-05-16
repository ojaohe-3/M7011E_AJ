import { randomUUID } from "crypto";
import { Types } from "mongoose";
import { DB } from "../DB-Connector/db-connector";
import RabbitHandler from "../handler/RabbitSeverHandler";
import { Source, Consumer } from "./node";

export interface ITicket {
    target: string // IComponent id
    price: number
    source: string // IProducer id who gave you power (takes the last one, i.e if you take from one source 99% first then 1% later 100% will be to the latter part for simplisity)
    amount: number
}
export interface INetwork {
    id: string
    tickets: ITicket[]
    name: string
    updatedAt: Date
}
const env = process.env.MAX_TICKETS_BACKLOG
const MAX_LENGHT_TICKETS_BACKLOG: number = env ? +env : 10_000

type KeyMap<T> = {[key: string]: T} 
export default class Network implements INetwork {

    // private _network: INetwork;
    private _consumers: KeyMap<Consumer>;
    private _suppliers:KeyMap<Source>;

    public tickets: ITicket[];
    public name: string;
    public updatedAt: Date;
    public id: string;

    private _netpower: number = 0;

    constructor(network?: INetwork) {
        this._consumers = {};
        this._suppliers = {};

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
        RabbitHandler.instance.createRPCChannel(this.name);
        RabbitHandler.instance.on("clear", this.clear_tickets);
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
        sources.forEach(s => this._suppliers[s.id] = s)
    }
    public addConsumers(...consumers: Consumer[]) {
        consumers.forEach(c => this._consumers[c.id] = c)
    }

    public removeSupplier(s: Source) {
    
        delete this._suppliers[s.id];
    }

    public removeConsumer(c: Consumer) {
        delete this._consumers[c.id];
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



        let total_demand = 0;
        let total_supply = 0;

        // full defined network at this point, this might be reused later in other services that is fine
        Object.entries(this._suppliers).forEach(([_, s]) => {
            total_demand += s.demand;
            total_supply += s.output;
        });
        Object.entries(this._consumers).forEach(([_, c]) => total_demand += c.demand);

        console.log("demand:", total_demand,"supply:", total_supply)

        const tickets: ITicket[] = [];

        let consumer = demanders.pop();
        let producer = producers.pop();

        // While we still have a consumer or prosumer left
        while (consumer && producer) {
            // supply the producer first 
            let supply: number = producer.output - producer.demand; 
            // tickets infere where the energy was tacken from, it can be from multiple sources
            if(producer.demand > 0){
                tickets.push({
                    target: producer.id,
                    price: 0,
                    source: producer.id,
                    amount: supply > 0 ? producer.demand : producer.output
                });
            }
            // demander has demand, producer exist and there is supply
            while (consumer !== undefined && producer !== undefined && supply > 0) {
                // take from supply
                let take: number = supply - consumer.demand;

                // if we dont have enough supply to take
                if (take > 0) {
                    // otherwise supply demander with all.
                    supply -= consumer.demand;
                    tickets.push({
                        target: consumer!.id,
                        price: take * producer.price,
                        source: producer.id,
                        amount: take
                    });
                    console.log(consumer.id, "took", take, "from", producer.id)
                    consumer = demanders.pop();
                }
               

            }
            producer = producers.pop();

        }

        this._netpower += total_supply - total_demand;

        this.updatedAt = new Date();
        this.tickets.push(...tickets);
        // Defined 
        if (this.tickets.length >= MAX_LENGHT_TICKETS_BACKLOG) {
            RabbitHandler.instance.sendData("datamonitor", this.tickets);
            this.clear_tickets();
        }
        this.document();
        return tickets;
    }
    public async clear_tickets() {
        this.tickets = [];
        await this.document();
    }


}