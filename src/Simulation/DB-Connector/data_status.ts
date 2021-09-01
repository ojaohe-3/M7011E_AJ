import { Schema,  model, Document, Model, Number, Types} from 'mongoose';

export interface IDataStatus extends Document
{
    date: number
    output: number
    demand: number
    netPower: number
    id: string
}


export interface DataStatusModel extends Model<IDataStatus>{};

export class DataStatusSchema {

    private _model: Model<IDataStatus>;

    constructor(){
        const DataStatus = new Schema({
            date: {type: Number, required : true},
            demand: {type: Number, required : true},
            output: {type: Number, required : true},
            netPower: {type: Number, required : true},
            id: {type: String, required : true},
        });
        this._model = model<IDataStatus>('DataStatus', DataStatus)
    }

    public get model(): Model<IDataStatus> {
        return this._model
    }
};