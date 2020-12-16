import { Schema,  model, Document, Model, Number } from 'mongoose';

declare interface IConsumer extends Document{
    demand: number,
    timefn: number[],
    profile: number,
    name: String
}
export interface ConsumerModel extends Model<IConsumer>{};

export class ConsumerSchema {

    private _model: Model<IConsumer>;

    constructor(){
        const customerSchema = new Schema({
            demand: Number,
            timefn: [{ type: Number, required : true}],
            profile: Number,
            name: String
        });
        this._model = model<IConsumer>('Consumer', customerSchema)
    }

    public get model(): Model<IConsumer> {
        return this._model
    }
};