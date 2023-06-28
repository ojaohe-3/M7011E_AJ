

 import { Schema,  model, Document, Model, Number} from 'mongoose';

declare interface IManager extends Document{
    current: number,
    maxProduciton: number,
    status: Boolean,
    ratio: number,
    name: String,
    price: number
}
export interface ManagerModel extends Model<IManager>{};

export class ManagerSchema {

    private _model: Model<IManager>;

    constructor(){
        const ManagerSchema = new Schema({
            current: Number,
            maxProduciton: Number,
            production : Number,
            status: Boolean,
            ratio: Number,
            name: {type: String, required : true}
        });
        this._model = model<IManager>('Manager', ManagerSchema)
    }

    public get model(): Model<IManager> {
        return this._model
    }
};