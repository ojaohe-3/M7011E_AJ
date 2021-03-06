import { Schema,  model, Document, Model, Number } from 'mongoose';

declare interface IMarket extends Document{
    name: String,
    cells: String[]
}
export interface MarketModel extends Model<IMarket>{};

export class MarketSchema {

    private _model: Model<IMarket>;

    constructor(){
        const MarketSchema = new Schema({
            cells: [{type: String}],
            name: {type: String, required : true}
        });
        this._model = model<IMarket>('Market', MarketSchema)
    }

    public get model(): Model<IMarket> {
        return this._model
    }
};