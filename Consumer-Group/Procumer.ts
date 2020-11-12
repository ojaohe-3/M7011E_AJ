import { v4 as uuidv4 } from 'uuid';
import { NormalDistribution } from "normal-distribution";
import {Consumer} from './consumer';
uuidv4();

class Procumer extends Consumer{
    Procumer(turbines: Turbine[], batteries: Battery[]){
        
        
    }
}

class Turbine{
    maxPower: number;//for display only
    profile: (speed: number) => number;

   currentPower(speed: number) : number{ 
       return this.profile(current)
    }

    Turbine(maxPower: number, profile: (power: number) => number){
        this.profile = profile;
        this.maxPower = maxPower;
    }
}
class Battery{

}