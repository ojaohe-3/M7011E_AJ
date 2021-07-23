

import { connect, connection, Connection } from 'mongoose';
import { UserModel, UserSchema } from './user';
export declare interface IModels {
  User?: UserModel
}
export class DB{
  
  private static instance: DB;
  
  public static get Instance() : DB{
    if(!this.instance)
    this.instance = new DB();
    return this.instance;
  }
  private _db: Connection; 
  private _models: IModels;

  constructor(){
      this._models = {
        User: new UserSchema().model
      }
    connect(process.env.DB_CONNECT,{useNewUrlParser: true});
    this._db = connection;
    this._db.on('open', this.connected);
    this._db.on('error', this.error);
  }

  public static get Models(): IModels {
    return DB.instance._models;
  }

  private connected() {
      console.log('Mongoose has connected');
  }

  private error(error) {
      console.log('Mongoose has error', error);
  }
}