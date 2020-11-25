import { Procumer } from './procumer';
import { Consumer } from './consumer';
import { Manager } from './manager';
import { Weather, Position} from '../Weather-Module/weather';

export class Simulator{
    consumers: Map<String, Consumer>;
    proumers: Map<String, Procumer>;
    managers: Map<String, Manager>;
    weather: Weather;
    pos : Position;


    Simulator(pos: Position){
        this.consumers = new Map<String, Consumer>();
        this.proumers = new Map<String, Procumer>();
        this.managers = new Map<String, Manager>();
        this.weather = new Weather(pos);
        this.pos = pos;
    }

    async tick(){
        const pr = Array.from(this.proumers.values());
        const mr = Array.from(this.managers.values());

        //fetch all procumers and consumers their current data
        await Promise.all(pr.map(async p => {
            const req = await fetch(p.destination+'/api/member/'+p.id);
            const data = await req.json();

            const old = this.proumers.get(p.id);

            old.totalProduction = data.production.totalProduction;
            old.totalCapacity = data.totalCapacity;
            old.currentCapacity = data.currentCapacity;
            old.status = data.status;
        }));

        await Promise.all(mr.map(async m => {
            const req = await fetch(m.destination+'/api/member/'+m.id);
            const data = await req.json();

            const old = this.managers.get(m.id);

            old.max_production = data.max_production;
            old.production = data.production;
            old.running = data.running;
        }));
    }
    totalLocalDemand(temp: number): number{
        let acc = 0;
        this.consumers.forEach(c => acc += c.consumption(temp));
        return acc;
    }
    totalLocalSupply(): number{
        let acc = 0;
        this.managers.forEach(m => acc += m.production);
        this.proumers.forEach(p => acc += p.totalProduction);
        return acc;
    }
    getTotalDemand(temp: number) : number{
        let acc = 0;
        this.consumers.forEach(e => acc += e.consumption(this.weather.temp));
        return acc;
    }

    getTotalSupply() : number{
        let acc = 0;
        this.proumers.forEach(e => acc += e.totalProduction);
        this.managers.forEach(e => acc += e.production);
        return acc;
    }
}
