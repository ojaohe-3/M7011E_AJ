

import { connect, connection, Connection } from 'mongoose';
import { CellModel, CellSchema } from './cell';
import { ConsumerModel, ConsumerSchema } from './consumer';
import { ManagerModel, ManagerSchema } from './manager';
import { MarketModel, MarketSchema } from './market';
import { ProsumerModel, ProsumerSchema } from './prosumer';
export declare interface IModels {
  Cell?: CellModel;
  Consumer?: ConsumerModel,
  Prosumer?: ProsumerModel,
  Market?: MarketModel,
  Manager?: ManagerModel
}
export class DB{
  
  private static instance: DB;
    
  private _db: Connection; 
  private _models: IModels;

  constructor(model? : IModels){
    if(model)
      this._models = model;
    else
      this._models = {
        Cell: new CellSchema().model,
        Consumer: new ConsumerSchema().model,
        Prosumer: new ProsumerSchema().model,
        Market: new MarketSchema().model,
        Manager: new ManagerSchema().model
      }
    console.log(process.env.DB_CONNECT);
    connect(process.env.DB_CONNECT,{useNewUrlParser: true});//secure access tokens etc todo
    this._db = connection;
    this._db.on('open', this.connected);
    this._db.on('error', this.error);
    if(model)
      DB.instance = this;

  }

  public static get Models(): IModels {
    if(!this.instance)
      this.instance = new DB();
    
    return DB.instance._models;
  }

  private connected() {
      console.log('Mongoose has connected');
  }

  private error(error) {
      console.log('Mongoose has error', error);
  }
}