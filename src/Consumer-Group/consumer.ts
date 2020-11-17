import { v4 as uuidv4 } from 'uuid';
import { NormalDistribution } from "normal-distribution";
uuidv4();
export class Consumer{
    id!: String;
    timefn!: (time: Date) => number;
    consumption!: (temp: number) => number;

    Consumer(timefn : (time: Date) => number){
        this.timefn = timefn;
        this.id = String(uuidv4.v4());
        const size = new NormalDistribution(4,2);
        const lamba =  new NormalDistribution(0,1);
        const profile = size*2.7 + lamba;
        let date = new Date();
        date.setDate(Date.now());
        this.consumption = (temp) => {
            return profile * (1/(100+temp)+timefn(date));
        }
    }
}