import {Consumer} from './consumer';

export class Procumer extends Consumer{
    totalProduction: number;
    totalCapacity: number;
    destination: String;

    constructor(id: String, timefn : (time: Date) => number, dest: String){
        super(id, timefn);
        this.destination = dest;
        this.totalProduction = 0;
        this.totalCapacity = 0;
    }

}