export class Manager{
    id : String;
    production :number;
    max_production :number;
    running: boolean;
    destination: String;
    constructor(id :String, production :number,
        max_production :number, destination: String, running: boolean){
            this.id = id;
            this.production = production;
            this.max_production = max_production;
            this.destination = destination;
            this.running = running;
        }    

}