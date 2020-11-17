import { v4 as uuidv4 } from 'uuid';
uuidv4();
export class Consumer{
    id!: String;
    timefn!: (time: Date) => number;
    consumption!: (temp: number) => number;

    Consumer(timefn : (time: Date) => number){
        this.timefn = timefn;
        this.id = String(uuidv4());
        const size = Math.random()*4 + 1;
        const lamba =  Math.random();
        const profile = size*2.7 + lamba;
        let date = new Date();
        date.setDate(Date.now());
        this.consumption = (temp) => {
            return profile * (1/(100+temp)+timefn(date));
        }
    }
}