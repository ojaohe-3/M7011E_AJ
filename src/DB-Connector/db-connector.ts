

import { connect, connection, Connection } from 'mongoose';
import { CellModel } from './cell';
import { ConsumerModel } from './consumer';
import { ManagerModel } from './manager';
import { MarketModel } from './market';
import { ProsumerModel } from './prosumer';
export declare interface IModels {
  Cell: CellModel;
  Consumer: ConsumerModel,
  Prosumer: ProsumerModel,
  Market: MarketModel,
  Manager: ManagerModel
}
export class DB{
  
  private static instance: DB;
    
  private _db: Connection; 
  private _models: IModels;

  constructor(model : IModels){
    this._models = model;
    connect(process.env.DB_CONNECT);//secure access tokens etc todo
    this._db = connection;
    this._db.on('open', this.connected);
    this._db.on('error', this.error);
    DB.instance = this;

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