
export class Consumer{
    id: String;
    timefn: () => number;
    consumption: (temp: number) => number;

    constructor(id : String, timefn : () => number){
        this.id = id;
        this.timefn = timefn;
        const r = Math.random();
        const rd = Math.random();
        const size = r*4- r*2+ rd*2 + 2; //pseudo normal distro random
        const lamba =  r- r/2+ rd/2;
        const profile = size*2.7 + lamba;
        this.consumption = (temp) => {
            return profile * ((273-temp)^2)+timefn();
        }
    }
}