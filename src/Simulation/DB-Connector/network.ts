import { Schema,  model, Document, Model, Number } from 'mongoose';

declare interface INetwork extends Document{

}
export interface NetworkModel extends Model<INetwork>{};

export class NetworkSchema {

    private _model: Model<INetwork>;

    constructor(){
        const networkSchema = new Schema({


        });
        this._model = model<INetwork>('Consumer', networkSchema)
    }

    public get model(): Model<INetwork> {
        return this._model
    }
};