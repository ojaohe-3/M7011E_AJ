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


    async tick(){

        const prosumers = Simulator.singelton.prosumers;
        const managers = Simulator.singelton.managers;

        if(prosumers){
            const pr = Array.from(prosumers.values());
            console.log('fetching data from prosumers')
            try {
                //fetch all procumers and consumers their current data
                await Promise.all(pr.map(async p => {
                    const req = await axios.get(p.name+'/api/member/'+p.id);
                    const data = req.data;

                    const old = prosumers.get(data.id);
                    if(old){
                        old.totalProduction = data.production.totalProduction;
                        old.totalCapacity = data.totalCapacity;
                        old.currentCapacity = data.currentCapacity;
                        old.status = data.status;
                    }else if(data){
                        this.prosumers.set(data.id, new Procumer(data.id, data.totalProduction, data.totalCapacity, data.current, data.status, p.name));
                    }else{
                        console.log('could not find: ' + data.id );
                    }
                }));
            } catch (error) {
                console.log(error);
            }
        }
        if(managers){
            const mr = Array.from(managers.values());
            console.log('fetching data from managers')

            try {
                await Promise.all(mr.map(async m => {
                    const req = await fetch(m.name+'/api/member/'+m.id);
                    const data = await req.json();
        
                    const old = managers.get(m.id);
        
                    old.max_production = data.max_production;
                    old.current = data.production;
                    old.running = data.running;
                }));
            } catch (error) {
                console.log(error);
            }
        }
        
    }

    getTotalDemand() : number{
        let acc  = 0;
        this.consumers.forEach(e => acc += e.consumption(Weather.singleton.temp));
        return acc;
    }

    getTotalSupply() : number{
        let acc = 0; 
        this.prosumers.forEach(async e => acc +=  e.totalProduction);
        this.managers.forEach(async e => acc +=  e.current);
        return acc;
    }
}
