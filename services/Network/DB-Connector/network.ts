import { Schema, model, Document, Model, Number, Types } from 'mongoose';

export interface ITicket extends Document {
    price: number
    source: string
    amount: number
    target: string
}
export declare interface INetwork extends Document {
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
            // _id: { type: Types.ObjectId, requrired: true, unique: true},

            name: { type: String, required: true, unique: true },
            updatedAt: { type: Date, required: true },
            tickets: [tickets]
        });
        this._model = model<INetwork>('Network', networkSchema)
    }

    public get model(): Model<INetwork> {
        return this._model
    }
};