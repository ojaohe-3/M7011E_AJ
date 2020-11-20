export class Manager{
    production :number;
    max_production :number;
    running: boolean;
    destination: String;
    constructor(production :number,
        max_production :number, destination: String, running: boolean){
            this.production = production;
            this.max_production = max_production;
            this.destination = destination;
            this.running = running;
        }    

}