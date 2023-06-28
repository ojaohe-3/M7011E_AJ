// import { Schema, model, Document, Model, Number, Types } from 'mongoose';
// import { IComponent } from './node';

// export declare interface IProducer extends IComponent {
//     price: number
// }

// export interface ITicket extends Document {
//     price: number
//     source: string
//     amount: number
//     target: string
// }
// export declare interface INetwork extends Document {
//     suppliers: IProducer[]
//     consumers: IComponent[]
//     total_demand: number
//     total_supply: number
//     netpower: number
//     tickets: ITicket[]
//     // name: string
//     updatedAt: Date
// }
// export interface NetworkModel extends Model<INetwork> { };

// export class NetworkSchema {

//     private _model: Model<INetwork>;

//     constructor() {
//         const tickets = new Schema({
//             price: { type: Number, required: true },
//             source: { type: String, required: true },
//             target: { type: String, required: true },
//             amount: { type: Number, required: true },
//         });

//         const consumers = new Schema({
//             type: { type: String, required: true },
//             output: { type: Number, required: true },
//             demand: { type: Number, required: true },
//             asset: { type: String, required: true },
//             id: { type: String, required: true }
//         })

//         const suppliers = new Schema({
//             type: { type: String, required: true },
//             output: { type: Number, required: true },
//             demand: { type: Number, required: true },
//             asset: { type: String, required: true },
//             id: { type: String, required: true },
//             price: { type: Number, required: true },
//         })

//         const networkSchema = new Schema({
//             total_supply: { type: Number, required: true },
//             total_demand: { type: Number, required: true },
//             netpower: { type: Number, required: true },
//             // name: { type: String, required: true, unique: true },
//             updatedAt: { type: Date, required: true },
//             suppliers: [suppliers],
//             consumers: [consumers],
//             tickets: [tickets]
//         });
//         this._model = model<INetwork>('Consumer', networkSchema)
//     }

//     public get model(): Model<INetwork> {
//         return this._model
//     }
// };