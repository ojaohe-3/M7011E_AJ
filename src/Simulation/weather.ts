const axios = require('axios');
export interface Location{
    lat : number;
    lon : number;
}

export interface IWeather{
    temp: number;
    speed: number;
    position: Location;
}
export class Weather{
    
    temp: number;
    speed: number;
    position: Location;
    
    private static singleton: Weather;
    update: () => Promise<void>;

    constructor(pos: Location){
        this.temp = 0;
        this.speed = 0;
        this.position = pos;
        this.update = async() => {
            try{
                const req = await axios.get(process.env.WEATHER_MODULE+`?lat=${this.position.lat}&lon=${this.position.lon}`);
                const data = req.data;
                this.temp = data.temp;
                this.speed = data.speed
            }catch (error){
                console.log(error);
            }
        }
        setInterval(this.update, 3600000);//update every hour

    }
    static get Instance() : Weather {
        if(!Weather.singleton)
            Weather.singleton = new Weather({lat: +process.env.LAT!, lon: +process.env.LON!});
        return Weather.singleton;
    }
    
    public toJson () {
        return {
            temp: this.temp,
            speed: this.speed,
            position: this.position
        }
    }
}
