import {Consumer} from './consumer';

export class Procumer extends Consumer{
    totalProduction: number;
    totalCapacity: number;
    currentCapacity: number;
    destination: String;

    constructor(id: String, timefn : (time: Date) => number,production: number, capacity: number,current: number, dest: String){
        super(id, timefn);
        this.destination = dest;
        this.totalProduction = production;
        this.currentCapacity = current;
        this.totalCapacity = capacity;
    }

}