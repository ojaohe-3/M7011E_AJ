import { Types } from "mongoose";
import Node, { IProducer } from "./node";
import { DB } from '../DB-Connector/db-connector';
import DefaultNode from "./defaultnode";

export default class Grid {
    private _nodes: Node[][]
    width: number
    height: number
    id: string

    constructor(width?: number, height?: number, id?: string) {
        this.id = id ? id : Types.ObjectId().toHexString();
        this._nodes = [];
        this.width = width ? width : 64;
        this.height = height ? height : 64;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this._nodes[y][x] = new Node(this.id, x, y, new DefaultNode());
            }
        }
    }

    public getAt(x: number, y: number): Node | undefined {
        try {
            return this._nodes[y][x];
        } catch (error) {
            console.log(error)
            return undefined;
        }
    }

    public setAt(x: number, y: number, value: Node): void {
        this._nodes[y][x] = value;
    }

    public tick() {
        this._nodes.forEach(col => col.map((v: Node) => v.tick(Date.now())));
    }

    public get nodes() {
        return this._nodes;
    }

    public async document() {
        const body = {
            width: this.width,
            height: this.height,
            _id: this.id
        }
        try {
            DB.Models.Grid.findByIdAndUpdate(this.id, body, { upsert: true }).exec();
        } catch (error) {
            console.log(error);
        }
    }
}