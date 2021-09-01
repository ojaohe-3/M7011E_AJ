import * as fs from 'fs'
import { Weather, IWeather } from '../weather'
import { IComponent } from '../models/node';
import { DB } from '../DB-Connector/db-connector';

interface DataStatus {
    date: number
    output: number
    demand: number
    netPower: number
    id: string
    cost: number
    // weather: IWeather
}

export default class DataMonitor {

    private static _maxSize: number = 80000 
    private static _timeToClear: number = 86400000 // 1 day in ms
    private static _instance: DataMonitor | null = null
    private static _subSambpleSize: number = 100
    private file: string
    private _logDate: number | null
    private _status: Map<string, DataStatus[]>;

    public static get instance(): DataMonitor {
        if (!this.instance) {
            this._instance = new DataMonitor();
        }
        return this._instance!;
    }

    constructor() {
        this._logDate = null
        this.file = "program.log"
        this._status = new Map<string, DataStatus[]>();
    }

    private _clearData() {
        fs.writeFileSync(this.file, '')
        this._status.clear()
        this._logDate = Date.now()
    }

    private _handleEntryData(entry: DataStatus[]) {
        for(let i = 0; i < DataMonitor._subSambpleSize; i++) {
            const item = (entry[(i*(entry.length/DataMonitor._subSambpleSize))%entry.length]);
            this.document(item);
        }
    }


    private _mapOverflow() {
        this._status.forEach((entry, key) => {
            if(entry.length > DataMonitor._maxSize){
                this._handleEntryData(entry)
                this._status.set(key, []);
            }  
        })
    }

    private _dayElapsed() {
        if (!this._logDate) {
            return false
        }

        const diff = Date.now() - this._logDate!
        return diff / DataMonitor._timeToClear > 1
    }

    public log(message: string) {
        if (!this._logDate) {
            this._logDate = Date.now()
        } else if (this._dayElapsed()) {
            this._clearData()
        }
        const date = new Date(Date.now())

        const m = `[${date.getHours()}:${date.getMinutes()} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}] ${message}`

        fs.appendFileSync(this.file, m)
    }

    public status(caller: IComponent): DataStatus {
        if (this._dayElapsed() || this._mapOverflow()) {
            this._clearData()
        }

        const date = Date.now()
        const output = caller.output;
        const demand = caller.demand;
        // const weather = Weather.Instance.toJson();

        const obj = {
            date,
            output,
            demand,
            netPower: output - demand,
            id: caller.id,
            cost: caller.cost
            // weather
        }
        
        const item = this._status.get(caller.id)
        if (item) {
            item.push(obj)
        } else {
            this._status.set(caller.id, [obj])
        }
        return obj;
    }
    public async document(item: DataStatus) {
        try {
            await DB.Models.DataStatus!.create(item);
        } catch (error) {
            console.log(error)
        }
           
    }

    public async get(id: string): Promise<DataStatus[] | undefined> {
        const items : DataStatus[] | undefined = this._status.get(id);
        const old : DataStatus[] | undefined = await DB.Models.DataStatus.find({id: id});
        return items && old ? items.concat(old): old ? old : items? items : undefined;
    }
}
