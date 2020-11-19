
export class Consumer{
    id!: String;
    timefn!: (time: Date) => number;
    consumption!: (temp: number) => number;

    constructor(id : String, timefn : (time: Date) => number){
        this.id = id;
        this.timefn = timefn;
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