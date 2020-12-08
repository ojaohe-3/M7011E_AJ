 import { Schema,  model, Document, Model, Number } from 'mongoose';

declare interface IProcumer extends Document{
    totalProduction: Number,
            totalCapacity: Number,
            currentCapacity: Number,
            batteries: {
                capacity: Number,
                current: Number,
                maxOutput: Number,
                maxCharge: Number
            }[],
            turbines: {
                maxPower: Number
            }[],
            name: String,
            status: Boolean,
}


export interface ProsumerModel extends Model<IProcumer>{};

export class ProsumerSchema {

    private _model: Model<IProcumer>;

    constructor(){
        const battery = new Schema({
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
            status: Boolean,
        });
        this._model = model<IProcumer>('Market', ProcumerSchema)
    }

    public get model(): Model<IProcumer> {
        return this._model
    }
};