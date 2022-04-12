

import { connect, connection, Connection } from 'mongoose';
import { NetworkModel, NetworkSchema } from './network';
export declare interface IModels {
  Network: NetworkModel,
}
export class DB{
  
  private static instance?: DB;
  private static get Instance() : DB{
    if(!this.instance)
      this.instance = new DB();
    return this.instance;
  }
  private _db: Connection; 
  private _models: IModels;

  constructor(model? : IModels){
    if(model)
      this._models = model;
    else
      this._models = {
        Network: new NetworkSchema().model,
      }
    connect(process.env.DB_CONNECT!,{useNewUrlParser: true}!);//secure access tokens etc todo
    this._db = connection;
    this._db.on('open', this.connected);
    this._db.on('error', this.error);
    if(model)
      DB.instance = this;

  }

  public static get Models(): IModels {
    if(!this.instance)
      this.instance = new DB();
    
    return DB.instance!._models;
  }

  private connected() {
      console.log('Mongoose has connected');
  }

  private error(error) {
      console.log('Mongoose has error', error);
  }
}