import { Schema,  model, Document, Model, Number, Types} from 'mongoose';



export interface IGrid extends Document{
    width: number;
    heigt: number;
    _id: string;
}


export interface GridModel extends Model<IGrid>{};

export class GridSchema {

    private _model: Model<IGrid>;

    constructor(){
        const GridSchema = new Schema({
            width: {type: Number, required : true},
            height: {type: Number, required : true},
            _id: {type: Types.ObjectId, required: true}
        });
        this._model = model<IGrid>('Grid', GridSchema)
    }

    public get model(): Model<IGrid> {
        return this._model
    }
};