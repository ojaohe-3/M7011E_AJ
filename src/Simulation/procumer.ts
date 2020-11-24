
export class Procumer{
    totalProduction: number;
    totalCapacity: number;
    currentCapacity: number;
    destination: String;
    status: boolean;
    id: String;

    constructor(id: String, production: number, capacity: number,current: number,status: boolean, dest: String){
        this.destination = dest;
        this.status = status;
        this.totalProduction = production;
        this.currentCapacity = current;
        this.totalCapacity = capacity;
        this.id = id;
    }

}