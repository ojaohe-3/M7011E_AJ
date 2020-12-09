import { Procumer } from './procumer';
import { Consumer } from './consumer';
import { Manager } from './manager';
import { Weather, Position} from './weather';
const fetch = require("node-fetch");

export class Simulator{
    consumers: Map<String, Consumer>;
    prosumers: Map<String, Procumer>;
    managers: Map<String, Manager>;
    weather: Weather;
    pos : Position;

    static singelton: Simulator;
    name: String;
    manager_name: String;
    prosumer_name: String;

    constructor(pos: Position, name : String, manager_name: String, prosumer_name: String){
        this.consumers = new Map<String, Consumer>();
        this.prosumers = new Map<String, Procumer>();
        this.managers = new Map<String, Manager>();
        this.name = name;
        this.manager_name = manager_name;
        this.prosumer_name = prosumer_name;
        this.weather = new Weather(pos);
        this.pos = pos;
        Simulator.singelton = this;
        
    }


    async tick(){
        if(this.prosumers){
            const pr = Array.from(this.prosumers.values());

            try {
                //fetch all procumers and consumers their current data
                await Promise.all(pr.map(async p => {
                    const req = await fetch(p.name+'/api/member/'+p.id);
                    const data = await req.json();

                    const old = this.prosumers.get(p.id);

                    old.totalProduction = data.production.totalProduction;
                    old.totalCapacity = data.totalCapacity;
                    old.currentCapacity = data.currentCapacity;
                    old.status = data.status;
                }));
            } catch (error) {
                console.log(error);
            }
        }
        if(this.managers){
            const mr = Array.from(this.managers.values());
            try {
                await Promise.all(mr.map(async m => {
                    const req = await fetch(m.name+'/api/member/'+m.id);
                    const data = await req.json();
        
                    const old = this.managers.get(m.id);
        
                    old.max_production = data.max_production;
                    old.production = data.production;
                    old.running = data.running;
                }));
            } catch (error) {
                console.log(error);
            }
        }
        
    }

    getTotalDemand() : number{
        let acc  = 0;
        this.consumers.forEach(e => acc += e.consumption(this.weather.temp));
        return acc;
    }

    getTotalSupply() : number{
        let acc = 0;
        this.prosumers.forEach(e => acc += e.totalProduction);
        this.managers.forEach(e => acc += e.production);
        return acc;
    }
}
