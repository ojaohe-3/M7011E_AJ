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
            if(speed > 3 && speed < 24.6){
                if(speed >= 12){
                    ratio = 1.0;
                }else{
                    ratio = 1/12*speed;
                }
            }
            return maxPower*ratio;
        };
        this.maxPower = maxPower;
    }
}