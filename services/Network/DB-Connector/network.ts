import { Schema, model, Document, Model, Number, Types } from 'mongoose';

export interface ITicket extends Document {
    price: number
    source: string
    amount: number
    target: string
}
export declare interface INetwork extends Document {
    _id: Types.ObjectId
    // suppliers: string[]
    // consumers: string[]
    // total_demand: number
    // total_supply: number
    tickets: ITicket[]
    updatedAt: Date
    name: string
}
export interface NetworkModel extends Model<INetwork> { };

export class NetworkSchema {

    private _model: Model<INetwork>;

    constructor() {
        const tickets = new Schema({
            price: { type: Number, required: true },
            source: { type: String, required: true },
            target: { type: String, required: true },
            amount: { type: Number, required: true },
        });


        const networkSchema = new Schema({
            _id: { type: Types.ObjectId, requrired: true, unique: true},
            // total_supply: { type: Number, required: true },
            // total_demand: { type: Number, required: true },
            name: { type: String, required: true, unique: true },
            updatedAt: { type: Date, required: true },
            // suppliers: [String],
            // consumers: [String],
            tickets: [tickets]
        });
        this._model = model<INetwork>('Consumer', networkSchema)
    }

    public get model(): Model<INetwork> {
        return this._model
    }
};