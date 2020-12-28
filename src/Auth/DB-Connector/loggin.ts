import { Schema,  model, Document, Model, Types } from 'mongoose';

declare interface IUser extends Document{
    email: String,
    username: String,
    password: String,
    last_login: Date,
}
export interface UserModel extends Model<IUser>{};

export class UserSchema{
    private _model: Model<IUser>;

    constructor(){
        const userSchema = new Schema({
            email: String,
            username: String,
            password: String,
            last_login: Date,
        });
        this._model = model<IUser>('User', userSchema)
    }

    public get model(): Model<IUser> {
        return this._model
    }

}


