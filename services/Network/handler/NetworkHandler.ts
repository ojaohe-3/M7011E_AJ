import { DB } from "../DB-Connector/db-connector";
import Network, { INetwork } from "../models/network"
import RabbitHandler from "./RabbitHandler";

export default class NetworkHandler {

    private static _instance?: NetworkHandler;

    public static get instance(): NetworkHandler {
        return this._instance ? this._instance : new NetworkHandler();
    }
    private _networks: Map<string, Network>;
    private 

    constructor() {
        this._networks = new Map<string, Network>();
    }

    

    public async fetchAll() {
        try {
            const entry = await DB.Models.Network.find();
            entry.forEach(m => {
                const id = m._id.toHexString();
                const _net: INetwork = {
                    id,
                    tickets: m.tickets,
                    name: m.name,
                    updatedAt: m.updatedAt
                }
                const network = new Network(_net);
                this._networks.set(id, network);
            });
        } catch (error) {
            console.log(error);
        }
    }

    public getAll(): Network[] {
        return Array.from(this._networks.values());
    }
    public tick() {
    }
}