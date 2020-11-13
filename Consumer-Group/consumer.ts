import { v4 as uuidv4 } from 'uuid';
import { NormalDistribution } from "normal-distribution";
uuidv4();
export class Consumer{
    id: string;
    consumption: (temp: number, timefn: (time:number)=>number ) => number;

    Consumer(){
        this.id = uuidv4.v4();
        const size = new NormalDistribution(4,2);
        const lamba =  new NormalDistribution(0,1);
        const profile = size*2.7 + lamba;
        this.consumption = (temp, timefn) => {
            return profile * (1/(100+temp)+timefn(Date.now()));
        }
    }
}