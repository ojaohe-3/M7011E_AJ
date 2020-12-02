export class Turbine{
    maxPower: number; 
    profile: (speed: number) => number; //speed in kph, outputs current power, does not take into consideration time to spin with change of wind speed

    /**
     * Windturbine, simulates windturbine with input windspeed (in kph) to kwh
     * @param maxPower maximum Power possible for the turbine to produce
     */
    constructor(maxPower: number){
        
        this.profile = (speed) => {
            let ratio = 0.0;
            if(speed > 6.6 && speed < 50){
                if(speed >= 27){
                    ratio = 1.0;
                }else{
                    ratio = 0.037*speed;
                }
            }
            return maxPower*ratio;
        };
        this.maxPower = maxPower;
    }
}