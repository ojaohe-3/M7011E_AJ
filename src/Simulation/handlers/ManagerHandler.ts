import Axios from "axios";
import { DB } from "../DB-Connector/db-connector";
import  Manager  from "../models/manager";

export default class ManagerHandler{
    private static instance: ManagerHandler;
    private managers: Map<String, Manager>;

    constructor(){
        this.managers = new Map<String, Manager>();
        this.fetchAll(); //async, will be some garbage data first tick, but is acceptable. alternative is to call outside the function at index. 
    }

    public static get Instance(): ManagerHandler{
        if(!this.instance)
            this.instance = new ManagerHandler();
        return this.instance
    }

    /**
     * Insert new manager item to be handled.
     * @param id 
     * @param item 
     */
    public async put(id: String, item: Manager) {
        this.managers.set(id, item);
        await item.tick();
        await Axios.post(process.env.SIM +'/api/members/managers',{
            
                body: [
                    {
                        id: id,
                        maxProduciton: item.maxProduciton,
                        current: item.current,
                        status: item.status
                    }
                ]
        });
    }

    /** 
     * gets an item by its id
    */
    public getById(id: string) {
            return this.managers.get(id);
    }

    /**
     * returns all managers as an array
     */
    public getAll(){
        return Array.from(this.managers.values());
    }
    private async fetchAll(){
        try {
            const entry = await DB.Models.Manager.find({name: process.env.NAME}).exec();
            const publisher = [];
            entry.forEach(m => 
                { 
                    const man = new Manager(m.id, m.maxProduciton);
                    man.current = m.current;
                    man.ratio = m.ratio;
                    if( m.status)
                        man.status = true;
                    
                    this.managers.set(m.id, man);
                    publisher.push({
                        id: man.id,
                        maxProduciton: man.maxProduciton,
                        current: man.current,
                        status: man.status
                    });
                    
                });
                await Axios.post(process.env.SIM + '/api/members/managers', {
                    body: publisher
                });
                this.managers.forEach(async (m) => m.tick());
        } catch (error) {
            console.log(error);
        }
    }
}