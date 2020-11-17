import { v4 as uuidv4 } from 'uuid';
import {Consumer} from './consumer';
uuidv4();

class Procumer extends Consumer{
    totalProduction!: number;
    totalCapacity!: number;
    sources!: Turbine[];
    batteries!: Battery[];

    /**
     * A smarter consumer, requires input from user
     * @param turbines 
     * @param batteries 
     */
    Procumer(turbines: Turbine[], batteries: Battery[]){
        this.sources = turbines;
        this.batteries = batteries;
        this.totalProduction = 0;
        this.totalCapacity = 0;
        batteries.forEach((e)=>{this.totalCapacity+=e.capacity});
        
    }

    /**
     * Update simulation profile by accessing tick from weathermodule, speed and ratio necessetates input
     * @param speed 
     * @param ratio 
     */
    tick(speed: number, ratio: number){
        this.sources.forEach((turbine) => this.totalProduction += turbine.profile(speed));
        this.batteries.forEach((b) => {
            let tot = this.totalProduction;
            this.totalProduction -= b.Input(tot*(ratio/this.batteries.length)); //distribute input equally among all batteries
            this.totalProduction += b.Output(1);//always output 100% power from batteries
        });

    }
}

class Turbine{
    maxPower!: number; 
    profile!: (speed: number) => number; //speed in kph, outputs current power, does not take into consideration time to spin with change of wind speed

    /**
     * Windturbine, simulates windturbine with input windspeed (in kph) to kwh
     * @param maxPower maximum Power possible for the turbine to produce
     */
    Turbine(maxPower: number){
        
        this.profile = (speed) => {
            let ratio = 0.0;
            if(speed > 12.6 && speed < 90){
                if(speed >= 36 && speed <= 54){
                    ratio = 1.0;
                }else{
                    ratio = 0.028*speed;
                }
            }
            return maxPower*ratio;
        };
        this.maxPower = maxPower;
    }
}
class Battery{
    capacity!: number; // in kwh
 // in kwh
    current!: number;
    maxOutput!: number; // maximum output in kwh
 // maximum output in kwh
    maxCharge!: number; // maximum accepted input to chage in kwh
 // maximum accepted input to chage in kwh
    Battery(capacity: number, maxOutput: number, maxCharge: number){
        this.capacity = capacity;
        this.maxOutput = maxOutput;
        this.maxCharge = maxCharge;
        this.current = 0;
    }

    Input(power: number): number{
        const p = power < this.maxCharge ? power : this.maxCharge;
        this.current += p;
        
    
        if(this.current < this.capacity){
            return p;
        }
        else{
            const  dp = this.current - this.capacity;
            this.current = this.capacity;
            return dp;
        }
    }

    Output(ratio : number): number{
        const power = this.maxOutput*ratio ;
        const actual = power < this.maxOutput ? power : this.maxOutput;
        const dp = actual - this.current;
        
        this.current -= actual;
        if(this.current < 0){
            this.current = 0;
            return dp < actual ? dp : 0;
        }
        return actual;
        
        
    }
}