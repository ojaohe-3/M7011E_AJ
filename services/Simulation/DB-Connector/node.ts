import { Schema, model, Document, Model, Number, Types } from 'mongoose';

export interface IComponent extends Document {
    network: string;
    type: string;
    output: number;
    demand: number;
    asset: string;
    id: string;

}

export interface INode extends Document {
    x: number;
    y: number;
    child: IComponent;
    gid: string
}


export interface NodeModel extends Model<INode> { };

export class NodeSchema {

    private _model: Model<INode>;

    constructor() {
        const child = new Schema({
            network: { type: String, required: true },
            type: { type: String, required: true },
            output: { type: Number, required: true },
            demand: { type: Number, required: true },
            asset: { type: String, required: true },
            id: { type: String, required: true }  // note that this is not the _id field
        });
        const NodeSchema = new Schema({
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            child: child,
            gid: { type: Types.ObjectId, required: true }
        });
        this._model = model<INode>('Node', NodeSchema)
    }

    public get model(): Model<INode> {
        return this._model
    }
};