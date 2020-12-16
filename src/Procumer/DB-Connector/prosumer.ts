 import { Schema,  model, Document, Model, Number, Types} from 'mongoose';
import {Procumer} from './../Procumer/procumer'

export interface IBattery
{
    capacity: number,
    current: number,
    maxOutput: number,
    maxCharge: number
}
export interface ITurbine //this will be expanded uppon in the future
{
    maxPower: number
}
export interface IProcumer extends Document{
    totalProduction: number,
    totalCapacity: number,
    currentCapacity: number,
    batteries: IBattery[],
    turbines: ITurbine[],
    name: String,
    status: Boolean,
}


export interface ProsumerModel extends Model<IProcumer>{};

export class ProsumerSchema {

    private _model: Model<IProcumer>;

    constructor(){
        const battery = new Schema({//make sure _id is not pressent in this item and turbine
            capacity: Number,
            current: Number,
            maxOutput: Number,
            maxCharge: Number
        });
        const turbin = new Schema({//this might be extended in the futrue, if we need to include more neuanced turbines
            maxPower: Number
        })
        const ProcumerSchema = new Schema({
            totalProduction: Number,
            totalCapacity: Number,
            currentCapacity: Number,
            batteries: [battery],
            turbines: [turbin],
            name: String,
            status: Boolean

        });
        this._model = model<IProcumer>('Prosumer', ProcumerSchema)
    }

    public get model(): Model<IProcumer> {
        return this._model
    }
};