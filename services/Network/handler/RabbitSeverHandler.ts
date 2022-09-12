import client, { Connection, Channel, credentials } from 'amqplib';
import WorkHandler, { Handler } from './WorkHandler';
// import { buffer } from 'stream/consumers';
export type EventKeys = "receive_rpc" | "data_gatherd" | "clear" | "receive_msg" //TODO
export type KeyTypes = "source" | "consumer"


export type RabbitWorker = Handler<Arguments>
export type RabbitWorkHandler = WorkHandler<Arguments>
export interface Arguments {
    target: string
    content: ReceiveFormat[]
    channel: Channel
    correlationID?: any
    replyTo?: any
}
export interface ReceiveFormat {
    key_type: KeyTypes
    amount: number
    id: string
    price?: number
    additional?: number
    time_stamp?: number

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
    private _connecting: boolean;

    constructor() {
        this._connecting = false;
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

    public async connect() {
        if (this._connected || this._connecting) return;
        this._connecting = true;
        try {
            const opt = {
                credentials: credentials.plain(process.env.RABBITMQ_USER || "user", process.env.RABBITMQ_PASS || "password")
            }
            console.log("connecting to", process.env.RABBITMQ_CONNECTION_STRING || 'amqp://localhost:5672')
            this._connector = await client.connect(process.env.RABBITMQ_CONNECTION_STRING || 'amqp://localhost:5672', opt);
            this._connected = true;
            console.log("rabbitmq connected!")

        } catch (error) {
            console.log(error);
            this._connected = false;
            setTimeout(this.connect, 10000); // try to reconnect after 10s
            this._connecting = false;

        }
    }


    public async sendData(channel: string, data: any): Promise<void> {
        if (!this._connected) {
            return;
        }
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
    public async createChannel(name: string): Promise<client.Channel | undefined> {
        if (this._connected === false) {
            console.log("Not Connected!")
            return undefined;
        }
        try {

            console.log("creating channel")
            const c = await this._connector.createChannel();
            c.assertExchange(name, 'fanout', { durable: false });
            let q = await c.assertQueue("", { exclusive: true });
            await c.bindQueue(q.queue, name, "");
            c.consume(q.queue, (msg) => {
                // console.log('recived message processing...', msg)
                if (msg === null) {
                    console.log('received null!')
                    return;
                }

                const json: ReceiveFormat[] = JSON.parse(msg?.content.toString());


                this._workhandler.run("receive_msg", { target: name, content: json, channel: c })
                //             c.ack(msg);
            })
            // this._channels.set(name, c);
            console.log("created channel", name)
            return c!;
        } catch (error) {
            console.log(error)
            return undefined;
        }
    }

    // public async createRPCChannel(name: string): Promise<client.Channel | undefined> {
    //     if (this._connected === false) {
    //         console.log("Not Connected!")
    //         return undefined;
    //     }
    //     try {
    //         const c = await this._connector.createChannel()
    //         c.assertQueue(name, { durable: false });
    //         c.prefetch(1);
    //         this._channels.set(name, c);
    //         c.consume(name, (msg) => {
    //             console.log('recived message processing...')
    //             if (msg === null) {
    //                 console.log('received null!')
    //                 return;
    //             }
    //             const json: ReceiveFormat[] = JSON.parse(msg?.content.toString());
    //             const cid = msg!.properties.correlationId;
    //             const replyTo = msg!.properties.replyTo;

    //             this._workhandler.run("receive_rpc", { target: name, content: json, channel: c, correlationID: cid, replyTo: replyTo })
    //             c.ack(msg);
    //         })
    //         return c;
    //     } catch (error) {
    //         console.log(error)
    //         return undefined
    //     }
    // }

    public close() {
        this._connected = false;
        this._connector.close();
    }
}