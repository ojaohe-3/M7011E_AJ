
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
        const profile = size*.027 + lamba*0.2;
        this.consumption = (temp) => {
            console.log(profile * (0.00001*(273-temp)^2)+timefn());
            return profile * (0.00001*(273-temp)^2)+timefn();
        }
    }
}