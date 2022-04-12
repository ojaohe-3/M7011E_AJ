import { Schema, model, Document, Model, Types, ObjectId } from "mongoose";

declare interface IPrivilage {
  level: Number;
  access?: string;
  id: string;
}

export declare interface IUser extends Document {
  _id: ObjectId;
  username: string;
  password: string;
  type: string;
  main?: string;
  managers?: Array<IPrivilage>;
  prosumers?: Array<IPrivilage>;
  admin: boolean;
  last_login?: Date;
}
export interface UserModel extends Model<IUser> {}

export class UserSchema {
  private _model: Model<IUser>;

  constructor() {
    const privlage = new Schema({
      level: { type: Number, unique: false, required: true },
      access: { type: Number, unique: false, required: false },
      id: { type: String, unique: true, required: true },
    });

    const userSchema = new Schema({
      // _id: { required: true, unique: true, index: true, auto: true },
      username: { type: String, unique: true, required: true },
      password: { type: String, unique: false, required: true },
      main: { type: String, unique: false, required: false },
      type: { type: String, unique: false, required: true },
      managers: { type: [privlage], unique: false, required: false },
      prosumers: { type: [privlage], unique: false, required: false },
      admin: { type: Boolean, required: true, default: false },
      last_login: { type: Date, default: Date.now() },
    });
    this._model = model<IUser>("User", userSchema);
  }

  public get model(): Model<IUser> {
    return this._model;
  }
}
