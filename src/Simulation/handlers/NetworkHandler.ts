import Network from "../models/network";
import DataMonitor from "./DataMonitor";

export default class NetworkHandler{

    private static _instance?: NetworkHandler;

    public static get instance(): NetworkHandler {
        return this._instance ? this._instance : new NetworkHandler();
    }
    private _networks :Map<string, Network>;
    constructor(){
        this._networks = new Map<string, Network>();
    }

    public getAll(): Network[] {
        return  Array.from(this._networks.values());
    }
    public tick() {
        this._networks.forEach((v) => v.tick())
    }
}