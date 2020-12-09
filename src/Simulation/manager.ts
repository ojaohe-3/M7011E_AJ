export class Manager{
    id : String;
    production :number;
    max_production :number;
    running: boolean;
    name: String;
    constructor(id :String, production :number,
        max_production :number, name: String, running: boolean){
            this.id = id;
            this.production = production;
            this.max_production = max_production;
            this.name = name;
            this.running = running;
        }    

}