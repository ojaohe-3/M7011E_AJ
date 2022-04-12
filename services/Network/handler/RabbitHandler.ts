import client, { Connection, Channel } from 'amqplib';
import WorkHandler, { Handler } from './workHandler';
// import { buffer } from 'stream/consumers';
export type EventKeys = "receive_rpc" | "data_gatherd" //TODO
export type KeyTypes = "source" | "consumer"


export type RabbitWorker = Handler<Arguments>
export type RabbitWorkHandler = WorkHandler<Arguments>


export interface Arguments{
    content: ReceiveFormat
    channel: Channel
    correlationID: any
}
export interface ReceiveFormat {
    type: KeyTypes,
    amount: number,
    id: string,
    price: number
}
export default class RabbitHandler {
    private static _instance: RabbitHandler;

    public static get instance() {
        if (this._instance === undefined) {
            this._instance = new RabbitHandler();
        }
        return this._instance;
    }


    private _channels: Map<string, Channel>
    private _connector!: Connection;
    private _connected: boolean;
    private _workhandler: RabbitWorkHandler;


    constructor() {
        this._connected = false;
        this._channels = new Map();
        this._workhandler = new WorkHandler();
        this.connect();
    }

    public get connected(): boolean {
        return this._connected;
    }

    public on(key: EventKeys, handler: RabbitWorker) {
        return this._workhandler.on(key, handler);
    }

    private async connect() {
        try {
            this._connector = await client.connect(process.env.RABBITMQ_CONNECTION_STRING || 'amqp://localhost:5672');
            this._connected = true;


        } catch (error) {
            console.log(error);
            setTimeout(this.connect, 10000); // try to reconnect after 10s
        }
    }


    // public async sendData(channel: string, data: any): Promise<void>{
    //     try {
    //         const json = JSON.stringify(data);
    //         if(!this._channels.has(channel)){
    //             await this.createChannel(channel);
    //         }
    //         const c = this._channels.get(channel);
    //         c?.publish(channel, '', Buffer.from(json));
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    public async createChannel(name: string): Promise<client.Channel | undefined> {
        if (this._connected === false){
            console.log("Not Connected!")
            return undefined;
        }
        try {
            const c = await this._connector.createChannel()
            c.assertQueue(name, { durable: false });
            this._channels.set(name, c);
            c.consume(name, (msg) => {
                if (msg === null) {
                    console.log('received null!')
                    return;
                }
                const json: ReceiveFormat = JSON.parse(msg?.content.toString());
                const cid = msg!.properties.correlationId;
                this._workhandler.run("receive_rpc", { content: json, channel: c, correlationID: cid})
                c.ack(msg);
            })
            return c;
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

    public close() {
        this._connected = false;
        this._connector.close();
    }
}