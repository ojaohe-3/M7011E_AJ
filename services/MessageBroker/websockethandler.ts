import { randomUUID } from 'crypto';
import { Server } from 'http';
import { ListFormat, Set } from 'typescript';
import WebSocket, { WebSocketServer } from 'ws';
import Monitor from './monitor';

export interface Client {
    id: string
    timestamp: number

    // stream: WebSocket.WebSocket
}

export interface Form {
    kind: "exchange" | "publish" | "subscribe" | "query" | "unsubscribe" | "data" | "ping";
    key: string;
    output: number;
    demand: number;
    id: string;
    time_stamp: number;
    updated: boolean;

}


// export interface HeartBeatMessage extends Partial<Form> {
//     timestamp: number
//     nr: number
// }
const HEARTBEAT_TIMEOUT_MS = 60_000
export default class WebSocketHandler {
    private wss: WebSocket.Server<WebSocket.WebSocket>;
    private exchanges: Set<string>;
    private clients: { [key: string]: Client }
    private pubs: { [key: string]: Client[] }
    private subs: { [key: string]: Client[] }
    private sockets: { [key: string]: WebSocket.WebSocket }
    private _number_messages = 0;

    constructor(server: Server) {
        this.wss = new WebSocket.Server({ server })
        this.clients = {};
        this.pubs = {};
        this.subs = {};
        this.sockets = {};

        this.wss.on("connection", (ws: WebSocket.WebSocket, req) => {
            const id = randomUUID();
            const ip = req.socket.remoteAddress!;
            const auth = req.headers.authorization; //TODO
            console.log(ip, "connected, assigning", id, "to client")

            this.clients[ip.toString()] = {
                id: id, // might change to url later
                timestamp: Date.now(),
                // stream: ws
            };

            this.sockets[id] = ws;

            Monitor.instant.number_of_active_connections += 1;
            Monitor.instant.number_of_connections += 1;

            ws.on("error", (err) => this.handleError(err));
            ws.on("close", (close) => {
                console.log("closing code", close)
                this.handleClose(ip)
            });
            ws.on("message", (msg) => this.handleMessage(msg, ws, ip));

        });
        setInterval(this.heartbeat.bind(this), HEARTBEAT_TIMEOUT_MS);
        this.exchanges = new Set<string>();
    }

    private handleMessage(msg: WebSocket.RawData, ws: WebSocket.WebSocket, ip: string) {
        try {
            Monitor.instant.read_traffic += 1;
            this._number_messages += 1;
            const raw: string = msg.toString();
            const form: Partial<Form> = JSON.parse(raw);
            this.clients[ip].timestamp = Date.now();
            const client = this.clients[ip];
            // const form: Form = JSON.parse(raw);
            switch (form.kind!) {
                case "exchange":
                    ws.send({ exists: this.exchanges.has(form.key!) }); // TODO remove or extend functionality of this
                    break;
                case "publish":
                    this.exchanges.add(form.key!);
                    const pub_client = { ...this.clients[ip] };
                    if (this.pubs[form.key!]) {
                        this.pubs[form.key!].push(pub_client);
                    } else {
                        this.pubs[form.key!] = [pub_client];
                    }
                    break;
                case "query":
                    const raw: string[] = [];
                    this.exchanges.forEach((value) => raw.push(value));
                    ws.send({ exchanges: raw })
                    break;
                case "subscribe":
                    const sub_client = { ...this.clients[ip] };
                    if (this.subs[form.key!]) {
                        this.subs[form.key!].push(sub_client);
                    } else {
                        this.subs[form.key!] = [sub_client];
                    }
                    break;
                case "unsubscribe":
                    const items = this.subs[form.key!].filter(c => c.id !== client.id);
                    this.subs[form.key!] = [...items];
                case "data":
                    this.sendToSubscribers(form);
                    break;
            }

        } catch (error) {
            this.handleError(error);
        }
    }


    private handleError(err: any) {
        console.log("socket error: ", err);
    }
    private handleClose(ip: string) {
        console.log("closing", ip)
        const uuid: string | undefined = this.clients[ip]?.id
        if (!uuid) {
            return;
        }
        // clear socket
        this.sockets[uuid].close();
        delete this.sockets[uuid];

        if (this.pubs[ip]) {
            delete this.pubs[ip];
        }
        if (this.subs[ip]) {
            delete this.subs[ip];
        }
        delete this.clients[ip];
        Monitor.instant.number_of_active_connections -= 1;
    }

    private sendToSubscribers(form: Partial<Form>) { // TODO async
        if (this.exchanges.has(form.key ?? "")) {
            Object.entries(this.subs[form.key!]).map(([key, val]) => {
                const ws = this.sockets[val.id];
                const send = { ...form };
                delete send.kind;
                delete send.key;
                ws.send(JSON.stringify(send));
                this._number_messages += 1;
                Monitor.instant.write_traffic += 1;
            });
        }

    }

    private heartbeat() {
        // TODO make async with random offset between ping to prevent call flooding

        Monitor.instant.push_to_average(this._number_messages);
        this._number_messages = 0;

        Object.entries(this.clients).forEach(([ip, c]) => {
            if (Date.now() - c.timestamp > HEARTBEAT_TIMEOUT_MS) {
                this.handleClose(ip);
            }
        })

        // Object.entries(this.clients).map(([id, c], i) =>
        //     this.sockets[c.id].send(JSON.stringify({ kind: "ping", timestamp: Date.now(), nr: this.heartbeat_number++ } as HeartBeatMessage)
        //     ));

    }

}