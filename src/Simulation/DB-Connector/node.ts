import { Schema,  model, Document, Model, Number, Types} from 'mongoose';

export interface IComponent extends Document
{
    // tick: (time?: number) => void;
    // supply : () => number;
    type: string;
    output: number;    
    demand: number;
    asset: string;
    id: string;

}

export interface INode extends Document{
    x: number;
    y: number;
    child: IComponent;
    // tick : (time?: number) => void;
}


export interface NodeModel extends Model<INode>{};

export class NodeSchema {

    private _model: Model<INode>;

    constructor(){
        const child = new Schema({
           type: {type: String, required : true},
           output: {type: Number, required : true},
           demand: {type: Number, required : true},
           asset: {type: String, required : true},
           id: {type: String, required : true}  // note that this is not the _id field
        });
        const NodeSchema = new Schema({
            x: {type: Number, required : true},
            y: {type: Number, required : true},
            child: child
        });
        this._model = model<INode>('Node', NodeSchema)
    }

    public get model(): Model<INode> {
        return this._model
    }
};