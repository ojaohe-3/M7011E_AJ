
export class Manager{
    id : String;
    current :number;
    max_production :number;
    running: boolean;
    name: String;
    constructor(id :String, current :number,
        max_production :number, name: String, running: boolean){
            this.id = id;
            this.current = current;
            this.max_production = max_production;
            this.name = name;
            this.running = running;
        }    

}