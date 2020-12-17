import { Procumer } from './procumer';
import { Consumer } from './consumer';
import { Manager } from './manager';
import { Weather, GeoLocation} from './weather';
const axios = require('axios');
export class Simulator{
    consumers: Map<String, Consumer>;
    prosumers: Map<String, Procumer>;
    managers: Map<String, Manager>;
    weather: Weather;//its a singleton so make it appear as such
    pos : GeoLocation;

    static singelton: Simulator;
    name: String;
    manager_name: String;
    prosumer_name: String;

    constructor(pos: GeoLocation, manager_name: String, prosumer_name: String){
        this.consumers = new Map<String, Consumer>();
        this.prosumers = new Map<String, Procumer>();
        this.managers = new Map<String, Manager>();
        this.manager_name = manager_name;
        this.prosumer_name = prosumer_name;
        this.weather = new Weather(pos);
        Weather.singleton = this.weather;
        this.name = process.env.NAME;
        this.pos = pos;
        Simulator.singelton = this;
    }


    async tick(){ //todo add caching here 

        // const prosumers = Simulator.singelton.prosumers;
        // const managers = Simulator.singelton.managers;

        // if(prosumers){
        //     const pr = Array.from(prosumers.values());

        //     try {
        //         //fetch all procumers and consumers their current data
        //         pr.forEach (async p => {
        //             const req = await axios.get(Simulator.singelton.prosumer_name+'/api/member/'+p.id);
        //             const data = req.data;
        //             const old = prosumers.get(data.id);
        //             if(old){
        //                 old.totalProduction = data.totalProduction;
        //                 old.totalCapacity = data.totalCapacity;
        //                 old.currentCapacity = data.currentCapacity;
        //                 old.status = data.status;
        //             }else if(data){
        //                 Simulator.singelton.prosumers.set(data.id, new Procumer(data.id, data.totalProduction, data.totalCapacity, data.current, data.status, p.name));
        //             }else{
        //                 console.log('could not find: ' + data.id );
        //             }
        //         });
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }
        // if(managers){
        //     const mr = Array.from(managers.values());

        //     try {
        //         mr.forEach(async m => {
        //             const req = await axios.get(Simulator.singelton.manager_name+'/api/member/'+m.id);
        //             const data = req.data;
        //             const old = managers.get(m.id);
        
        //             old.max_production = data.maxProduciton;
        //             old.current = data.current;
        //             old.running = data.status;
        //         });
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }
        
    }

    getTotalDemand() : number{
        let acc  = 0;
        Simulator.singelton.consumers.forEach(e => acc += e.consumption(Weather.singleton.temp));
        return acc;
    }

    getTotalSupply() : number{
        let acc = 0; 
        console.log(Simulator.singelton);
        Simulator.singelton.prosumers.forEach(e => acc +=  e.totalProduction);
        Simulator.singelton.managers.forEach(e => acc +=  e.current);
        return acc;
    }
}
