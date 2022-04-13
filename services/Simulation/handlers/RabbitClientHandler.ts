import client, { Connection, Channel } from 'amqplib';
import { randomUUID } from 'crypto';
import WorkHandler, { Handler } from './WorkHandler';
// import { buffer } from 'stream/consumers';
export type EventKeys = "receive_rpc" | "data_gatherd" | "clear" //TODO
export type KeyTypes = "source" | "consumer"


export type RabbitWorker = Handler<Arguments>
export type RabbitWorkHandler = WorkHandler<Arguments>
export interface ITicket {
    target: string // IComponent id
    price: number
    source: string // IProducer id
    amount: number
}

export interface Arguments {
    content: ITicket[]
    channel: Channel
}


export interface SendFormat {
    type: KeyTypes
    amount: number
    id: string
    price?: number
    additional?: number
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


    public async sendData(channel: string, data: any): Promise<void> {
        try {
            const json = JSON.stringify(data);
            if (!this._channels.has(channel)) {
                await this.createChannel(channel);
            }
            const c = this._channels.get(channel);
            c?.sendToQueue(channel, Buffer.from(json));
        } catch (error) {
            console.log(error);
        }
    }
    public async createChannel(name: string) {
        const c = await this._connector.createChannel()
        c.assertQueue(name, { durable: false });
        this._channels.set(name, c);
    }

    public async sendRPCData(name: string, data: SendFormat[]): Promise<client.Channel | undefined> {
        if (this._connected === false) {
            console.log("Not Connected!")
            return undefined;
        }
        try {
            const c = await this._connector.createChannel()
            const q = await c.assertQueue('', { exclusive: true });
            const cid = randomUUID();

            this._channels.set(name, c);
            c.consume(q.queue, (msg) => {
                if (msg?.properties.correlationId === cid) {
                    this._workhandler.run('receive_rpc', { channel: c, content: JSON.parse(msg!.content.toString())});
                }
            }, { noAck: true })

            c.sendToQueue(name,
                Buffer.from(JSON.stringify(data)), {
                correlationId: cid,
                replyTo: q.queue
            });
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