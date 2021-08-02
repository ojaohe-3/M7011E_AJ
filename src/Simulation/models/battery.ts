export interface IBattery{
    capacity: number; // in kwh
    current?: number; // current power in batteries 
    maxOutput: number; // maximum output in kwh
    maxCharge: number; // maximum accepted input to chage in kwh
}
export default class Battery implements IBattery{
    capacity: number; // in kwh
    current: number; // current power in batteries 
    maxOutput: number; // maximum output in kwh
    maxCharge: number; // maximum accepted input to chage in kwh

    constructor(capacity: number, maxOutput: number, maxCharge: number, current?: number){
        this.capacity = capacity;
        this.maxOutput = maxOutput;
        this.maxCharge = maxCharge;
        
        if(current)
            this.current = current;
        else
            this.current = 0;
    }
    /**
     * convert input power, and return the actual that was used up
     * @param power input
     */
    Input(power: number): number{
        const p = power < this.maxCharge ? power : this.maxCharge;
        this.current += p;
        
        if(this.current < this.capacity){
            return p;
        }
        else{
            this.current = this.capacity;
            return 0;
        }
    }
    /**
     * output, up until maximum output
     * @param ratio output ratio
     */
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