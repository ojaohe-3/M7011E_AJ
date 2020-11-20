export class Battery{
    capacity: number; // in kwh
    current: number; // current power in batteries 
    maxOutput: number; // maximum output in kwh
    maxCharge: number; // maximum accepted input to chage in kwh

    constructor(capacity: number, maxOutput: number, maxCharge: number){
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