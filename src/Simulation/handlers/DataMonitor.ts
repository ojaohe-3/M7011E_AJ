import * as fs from 'fs'
import { Weather, IWeather } from '../weather'
import { IComponent } from '../models/node';

interface DataStatus {
    date: number
    output: number
    demand: number
    netPower: number
    weather: IWeather
}

export default class DataMonitor {
    private static _maxMapSize: number = 80000 // 1 day in ms
    private static _timeToClear: number = 86400000 // 1 day in ms
    private static _instance: DataMonitor | null = null
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
        // TODO Make data analysis models in mongodb
        // TODO post subsample of entries.
    }

    private _mapOverflow() {
        if (this._status.size > DataMonitor._maxMapSize) {
            this._status.forEach((entry) => this._handleEntryData(entry))
        }
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
        const weather = Weather.Instance.toJson();

        const obj = {
            date,
            output,
            demand,
            netPower: output - demand,
            weather
        }
        
        const item = this._status.get(caller.id)
        if (item) {
            item.push(obj)
        } else {
            this._status.set(caller.id, [obj])
        }
        return obj;
    }
}
