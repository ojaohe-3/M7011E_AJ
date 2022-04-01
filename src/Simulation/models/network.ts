import { IComponent, IProducer } from "./node";

export interface ITicket {
    target: string
    price: number
    source: string
    amount: number
}
export interface INetwork {
    suppliers: IProducer[]
    consumers: IComponent[]
    total_demand: number
    total_supply: number
    netpower: number
    // connected: INetwork
    tickets: ITicket[]
    name: string
    updatedAt: Date
}

const UPDATE_EVERY_MS = 1000;
export default class Network {


    private _network: INetwork;


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
                name: process.env.NAME as string | 'undefined',
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

    process({ suppliers, consumers, total_demand, total_supply, netpower, name, updatedAt }: INetwork) {
        updatedAt = new Date();
        const updateTargets = (msg) => console.log("placeholder", msg);
        suppliers.sort((a, b) => a.price - b.price);

        suppliers.forEach(s => {
            total_demand += s.demand;
            total_supply += s.output;
        });
        consumers.forEach(c => total_demand += c.demand);

        const producers = [...suppliers] // copy
        const demanders = [...consumers] // copy
        const tickets: ITicket[] = [];

        let tdemand = total_demand;
        let tsupply = total_supply;

        let consumer = demanders.pop();
        let producer = producers.pop();


        while (consumer && producer) {
            let supply: number = producer.output - producer.demand;
            //demander has demand, producer exist and there is supply
            while (consumer && producer && supply > 0) {
                let take: number = supply - consumer.demand;

                if (take < 0) {
                    supply = 0
                    take = consumer.demand + take
                    tickets.push({
                        target: consumer.id,
                        price: take * producer.price,
                        source: producer.id,
                        amount: take
                    });
                    consumer.cost += take * producer!.price;

                } else {
                    consumer.demand = 0;
                    supply -= consumer.demand;
                    consumer.cost += take * producer!.price;
                    consumer = consumers.pop();
                }
                producer.output -= take;

            }
            producer = producers.pop();

        }
        let rsupply = 0;
        let rdemand = 0;

        producers.forEach(p => rsupply += p.output);
        consumers.forEach(c => rdemand += c.demand);
    }

})