import { Schema,  model, Document, Model } from 'mongoose';

declare interface ICell extends Document{
    manager_dest: String,
    prosumer_dest: String,
    name: String,
    pos: {lat: Number, lon: Number}
}
export interface CellModel extends Model<ICell>{};

export class CellSchema{
    private _model: Model<ICell>;

    constructor(){
        const cellSchema = new Schema({
            manager_dest: String,
            prosumer_dest: String,
            name: String,
            lat: Number,
            lon: Number
        });
        this._model = model<ICell>('Cell', cellSchema)
    }

    public get model(): Model<ICell> {
        return this._model
    }

}


