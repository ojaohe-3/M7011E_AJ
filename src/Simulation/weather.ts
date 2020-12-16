const axios = require('axios');
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
        this.temp = 270;
        this.speed = 7;
        this.pos = pos;
        this.update();
        setImmediate(this.update,3600000);//update every hour
        Weather.singleton = this;
    }
    
    async update(){
        try{
            console.log(this.pos);
            const req = await axios.get(process.env.WEATHER_MODULE+`?lat=${this.pos.lat}&lon=${this.pos.lon}`);
            const data = req.data;
            this.temp = data.temp;
            this.speed = data.speed
        }catch (error){
            console.log(error);
        }
    }
}
