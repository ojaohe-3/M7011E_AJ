import { Schema,  model, Document, Model, Types } from 'mongoose';


declare interface IUser extends Document{
    username: String,
    clientid: String,
    managers?: Array<string>,
    prosumers?: Array<string>,
    consumers?: Array<string>,
    last_login: Date,
}
export interface UserModel extends Model<IUser>{};

export class UserSchema{
    private _model: Model<IUser>;

    constructor(){
        const userSchema = new Schema({
            username: { type : String , unique : true, required : true },
            clientid: { type : String , unique : false, required : true },
          
            last_login: Date,
        });
        this._model = model<IUser>('User', userSchema)
    }

    public get model(): Model<IUser> {
        return this._model
    }

}


