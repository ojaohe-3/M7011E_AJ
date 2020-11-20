
export class Consumer{
    id: String;
    timefn: (time: Date) => number;
    consumption: (temp: number) => number;

    constructor(id : String, timefn : (time: Date) => number){
        this.id = id;
        this.timefn = timefn;
        const r = Math.random();
        const rd = Math.random();
        const size = r*4- r*2+ rd*2 + 2; //pseudo normal distro random
        const lamba =  r- r/2+ rd/2;
        const profile = size*2.7 + lamba;
        let date = new Date();
        date.setDate(Date.now());
        this.consumption = (temp) => {
            return profile * (1/(100+temp)+timefn(date));
        }
    }
}