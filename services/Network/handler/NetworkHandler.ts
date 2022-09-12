import { Types } from "mongoose";
import { DB } from "../DB-Connector/db-connector";
import Network, { INetwork } from "../models/network"
import { Consumer, Source } from "../models/node";
import RabbitHandler, { ReceiveFormat } from "./RabbitSeverHandler";

export default class NetworkHandler {

    private static _instance?: NetworkHandler;

    public static get instance(): NetworkHandler {
        return this._instance ? this._instance : new NetworkHandler();
    }
    private _networks: Map<string, Network>;

    constructor() {
        this._networks = new Map<string, Network>();

        RabbitHandler.instance.on("receive_msg", (msg) => {
            if (msg) {
                const { channel, content, target } = msg;
                console.log(`info { ch: ${channel} cnt: ${content} trg: ${target} }`)
                const network = this._networks.get(target);
                const sources: Source[] = [];
                const consumers: Consumer[] = [];

                content.forEach((v: ReceiveFormat) => {
                    // console.log(v)
                    switch (v.key_type.toLowerCase()) {
                        case "consumer":
                            consumers.push({
                                id: v.id,
                                demand: v.amount,
                                time_stamp: v.time_stamp ?? 0,
                                updated: false,
                            })
                            break;
                        case "source":
                            sources.push({
                                id: v.id,
                                price: v.price!,
                                output: v.amount,
                                demand: v.additional || 0,
                                time_stamp: v.time_stamp ?? 0,
                                updated: false,
                            })
                            break;
                    }
                })

                const tickets = network?.tick(consumers, sources);
                // console.log(tickets)
                // channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(tickets || [])), correlationID)
            }

        })

        // RabbitHandler.instance.createChannel("datamonitor");
    }



    public async fetchAll() {
        // TODO: Take only a fragment
        try {
            const entry = await DB.Models.Network.find();
            entry.forEach(m => {
                const id = m._id.toHexString();
                const _net: INetwork = {
                    id,
                    tickets: m.tickets,
                    name: m.name,
                    updatedAt: m.updatedAt,
                }
                const network = new Network(_net);
                this._networks.set(m.name, network);
                // console.log(this._networks) 
            });
        } catch (error) {
            console.log(error);
        }
    }
    public getAll(): Network[] {
        return Array.from(this._networks.values());
    }
    public addNet(data: Partial<INetwork>) {
        if (data.name) {
            let id = data.id || Types.ObjectId.createFromTime(Date.now()).toHexString();
            const net = new Network({ id, name: data.name!, tickets: data.tickets || [], updatedAt: data.updatedAt || new Date() });
            this._networks.set(net.id, net)
            net.document();
        } else {
            const net = new Network();
            this._networks.set(net.id, net);
            net.document();
        }
    }

    public get(id: string): Network | undefined {
        return this._networks.get(id);
    }


    public deleteNet(id: string) {
        this._networks.delete(id);
    }
}