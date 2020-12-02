
export class Consumer{
    id: String;
    timefn: () => number;
    consumption: (temp: number) => number;

    constructor(id : String, timefn : () => number){
        this.id = id;
        this.timefn = timefn;
        const r = Math.random();
        const rd = Math.random();
        const size = r*4- r*2+ rd*2 + 4; //pseudo normal distro random
        const lamba =  r- r/2+ rd/2 + 1;
        const profile = size*.027 + lamba*0.5;
        this.consumption = (temp) => {
            return profile * (0.002*Math.pow(294.15-temp,2))+timefn();
        }
    }
}