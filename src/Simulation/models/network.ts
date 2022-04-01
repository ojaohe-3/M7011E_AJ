import { IComponent, IProducer } from "./node";

export interface ITicket {
    target: string // IComponent id
    price: number
    source: string // IProducer id
    amount: number
}
export interface INetwork {
    suppliers: IProducer[]
    consumers: IComponent[]
    total_demand: number
    total_supply: number
    netpower: number
    // connected: INetwork this is a proposed solution for enabeling network to be past a simulation node to other in the cluster.
    tickets: ITicket[]
    // name: string
    updatedAt: Date
}

const UPDATE_EVERY_MS = 1000;
export default class Network {


    private _network: INetwork;
    private _time: number = Date.now();

    constructor(network?: INetwork) {
        if (network) {
            this._network = network;
        } else {
            this._network = {
                suppliers: [],
                consumers: [],
                total_demand: 0,
                total_supply: 0,
                netpower: 0,
                tickets: [],
                // name: process.env.NAME as string | 'undefined',
                updatedAt: new Date()
            }
            this.document();
        }
    }

    public async document() {

    }


    public get network(): INetwork {
        return this._network;
    }
    public set network(value: INetwork) {
        this._network = value;
    }



    /**
     * Tick takes the networks producers and consumers connected to it and resolves the cost for each consumer
     * and gives information what state each agent is inside the network
     * @param time 
     * @returns 
     */
    public tick(time: number) {
        if (time - this._time < UPDATE_EVERY_MS){
            return;
        }
        this._time = time;

        let { suppliers, consumers, total_demand, total_supply, netpower, updatedAt }: INetwork = this._network;
        updatedAt = new Date();
        suppliers.sort((a, b) => a.price - b.price);

        suppliers.forEach(s => {
            total_demand += s.demand;
            total_supply += s.output;
        });
        consumers.forEach(c => total_demand += c.demand);

        const producers = [...suppliers] // copy
        const demanders = [...consumers] // copy
        const tickets: ITicket[] = [];

        let consumer = demanders.pop();
        let producer = producers.pop();


        while (consumer && producer) {
            let supply: number = producer.output - producer.demand;
            // tickets infere where the energy was tacken from, it can be from multiple sources
            tickets.push({
                target: producer.id,
                price: 0,
                source: producer.id,
                amount: supply > 0 ? producer.demand : producer.output
            });
            //demander has demand, producer exist and there is supply
            while (consumer !== undefined && producer !== undefined && supply > 0) {
                let take: number = supply - consumer.demand;

                if (take < 0) {
                    supply = 0
                    take = consumer.demand + take
                    consumer.cost += take * producer.price;

                } else {
                    supply -= consumer.demand;
                    consumer.cost += take * producer.price;
                    consumer = consumers.pop();
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
        netpower = total_supply - total_demand;
        this.network = {
            suppliers,
            consumers,
            total_demand,
            total_supply,
            tickets,
            updatedAt,
            netpower,
        };
        this.document();
    }

}