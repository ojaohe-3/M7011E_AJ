import axios from "axios";
import Battery from "../models/battery";
import { DB } from "../DB-Connector/db-connector";
import { Procumer } from "../models/procumer";
import Turbine from "../models/Turbine";

export default class ProsumerHandler {
    /**
     * Handles all members of the simulation, to ease usage on the api modules 
     */
    private procumers: Map<String, Procumer>;
    private static instance: ProsumerHandler;

    constructor() {
        this.procumers = new Map<String, Procumer>();
    }

    /**
     * gets members from there id
     * @param id id used for the entry
     */
    public getById(id: String): Procumer | undefined {
        return this.procumers.get(id);

    }
    /**
     * set a new item into the prosumer registry.
     * @param item new item to update/create
     */
    public set(item: Procumer) {
        this.procumers.set(item.id, item);
    }

    public getAll(): Map<String, Procumer> {
        return this.procumers;
    }

    public static get Instance(): ProsumerHandler {
        if (!this.instance) {
            this.instance = new ProsumerHandler();
        }
        return this.instance;
    }
    private async fetchAll() {
        const data = await DB.Models.Prosumer!.find({ name: process.env.NAME }).exec();
        const publisher = [];
        data.forEach(async entry => {
            const bc : Battery[] = [];
            const tc : Turbine[] = [];
            entry.batteries.forEach(b => bc.push(new Battery(b.capacity, b.maxOutput, b.maxCharge, b.current)));
            entry.turbines.forEach(t => tc.push(new Turbine(t.maxPower)));

            const prosumer = new Procumer(bc, tc, entry.id);
            prosumer.status = true;
            this.set(prosumer);
        });

        // console.log(data);
    }
}