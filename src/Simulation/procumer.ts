const axios = require('axios');
export class Procumer{
    async getProduction() : Promise<number>{
        const data = await axios.get(this.name + "/api/member/"+ this.id).data;
        return data.totalProduction;
    }
    totalProduction: number;
    totalCapacity: number;
    currentCapacity: number;
    name: String;
    status: boolean;
    id: String;

    constructor(id: String, production: number, capacity: number,current: number,status: boolean, name: String){
        this.name = name;
        this.status = status;
        this.totalProduction = production;
        this.currentCapacity = current;
        this.totalCapacity = capacity;
        this.id = id;
    }

}