import { Types } from "mongoose";
import { DB } from "../DB-Connector/db-connector";
import DefaultNode from "./defaultnode";

export type Asset = "empty" | "consumer" | "windturbine" | "powerplant"
export interface IComponent {
    tick: (time: number) => void;
    output: number;
    demand: number;
    cost: number;
    asset: Asset;
    id: string;

}

export interface IProducer extends IComponent {
    price: number;
}

export interface INode {
    x: number;
    y: number;
    child: IComponent;
}
export default class Node implements INode {

    id: string;
    x: number;
    y: number;
    gid: string;

    child: IComponent;
    tick = (time: number) => this.child.tick(time);

    constructor(gid: string, x: number, y: number, child?: IComponent, id?: string) {
        this.id = id ? id : Types.ObjectId().toHexString();
        this.gid = gid;
        this.x = x;
        this.y = y;
        if (child)
            this.child = child;
        else
            this.child = new DefaultNode();
    }

    get demand() {
        return this.child.demand;
    }

    get output() {
        return this.child.output;
    }

    public isDefault(): boolean {
        return this.child.id === "Null";
    }

    public async document() {
        const body = {
            x: this.x,
            y: this.y,
            gid: this.gid
        }
        try {
            await DB.Models.Node!.findByIdAndUpdate(this.id, { ...body, ...this.child }, { upsert: true }).exec();
        } catch (error) {
            console.log(error);
        }
    }
}



