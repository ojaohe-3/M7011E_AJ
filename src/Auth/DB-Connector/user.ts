import { Schema,  model, Document, Model, Types } from 'mongoose';

declare interface IPrivilage{
    level: Number,
    access?: String,
    id: String
}

declare interface IUser extends Document{
    username: String,
    password: String,
    main: String
    managers?: Array<IPrivilage>,
    prosumers?: Array<IPrivilage>,
    consumers?: Array<string>,
    last_login?: Date,
}
export interface UserModel extends Model<IUser>{};

export class UserSchema{
    private _model: Model<IUser>;

    constructor(){
        const privlage = new Schema({
            level : {type : Number, unique: false, required: true},
            access : {type : Number, unique: false, required: false},
            id : {type : String, unique: true, required: true}
        });

        const userSchema = new Schema({
            username: { type : String , unique : true, required : true },
            password: { type : String , unique : false, required : true },
            main: { type : String , unique : false, required : true },
            managers: { type : [privlage] , unique : false, required : false },
            prosumers: { type : [privlage] , unique : false, required : false },
            consumers: { type : String , unique : false, required : false },
            last_login: Date,
        });
        this._model = model<IUser>('User', userSchema)
    }

    public get model(): Model<IUser> {
        return this._model
    }

}


