const fetch = require("node-fetch");
export interface Position{
    lat : number;
    lon : number;
}
export class Weather{
    
    temp: number;
    speed: number;
    pos: Position;
    
    static singleton: Weather;
    constructor(pos: Position){
        this.temp = 0;
        this.speed = 0;
        this.pos = pos;
        this.update();
        setImmediate(this.update,3600000);//update every hour
        Weather.singleton = this;
    }
    
    async update(){
        // try{
        //     const req = await fetch(process.env.WEATHER_MODULE+`?lat=${this.pos.lat}&lon=${this.pos.lon}`);
        //     const data = await req.json();
        //     this.temp = data.temp;
        //     this.speed = data.speed
        // }catch (error){
        //     console.log(error);
        // }
    }
}
