import DataMonitor from "../handlers/DataMonitor";
import { IComponent, IProducer } from "./node";

export interface INetwork {
    suppliers: IProducer[]
    consumers: Partial<IComponent>[]
    total_demand: number
    total_supply: number
    netpower: number
    connected: INetwork

}

export default class Network implements INetwork {

    private static _instance?: Network;

    public static get instance(): Network {
        return this._instance ? this._instance : new Network();
    }
    public suppliers!: IProducer[];
    public consumers!: Partial<IComponent>[];
    public total_demand!: number;
    public total_supply!: number;
    public netpower!: number;
    public connected!: INetwork;

    constructor() {

    }

    public async fetchAll() {

    }
    async document() {

    }

    public tick() {
        const monitor = DataMonitor.instance;
    }
}