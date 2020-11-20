import { Procumer } from './procumer';
import { Cell } from './cell'
import { Consumer } from './consumer';
import { Manager } from './manager';
export class Simulator{
    markup! : number;//todo
    cells: Map<String, Cell>;
    consumers: Map<String, Consumer>;
    proumers: Map<String, Procumer>;
    managers: Map<String, Manager>;

    Simulator(){
        this.cells = new Map<String, Cell>();
        this.consumers = new Map<String, Consumer>();
        this.proumers = new Map<String, Procumer>();
        this.managers = new Map<String, Manager>();
    }
    async tick(){
        const p = Array.from(this.proumers.values());
        const m = Array.from(this.managers.values());
        await Promise.all(p.map(async p => {
            const req = await fetch(p.destination+'/api/member/'+p.id);
            const data = await req.json();
            const old = this.proumers.get(p.id);
            old.consumption = data.
        }));
    }
    totalLocalDemand(temp: number): number{
        let acc = 0;
        this.consumers.forEach(c => acc += c.consumption(temp));
        this.proumers.forEach(c => acc += c.consumption(temp));
        return acc;
    }
    totalLocalSupply(): number{
        let acc = 0;
        this.managers.forEach(m => acc += m.production);
        this.proumers.forEach(p => acc += p.totalProduction);
        return acc;
    }
    async getTotalDemand(temp: number) : Promise<number>{
        let acc = 0;
        const data = Array.from(this.cells.values());//dont know how to do this from a map
        await Promise.all(data.map(async (c) => acc += await c.getDemand()));
        return acc+this.totalLocalDemand(temp);
    }

    async getTotalSupply() : Promise<number>{
        let acc = 0;
        const data = Array.from(this.cells.values());
        await Promise.all(data.map(async (c) => acc += await c.getSupply()));
        return acc + this.totalLocalSupply();
    }
}
