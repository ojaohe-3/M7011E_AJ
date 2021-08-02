import { Types } from "mongoose";
import Node, { IProducer } from "./node";
import { DB } from '../DB-Connector/db-connector';
import ConsumerHandler from '../handlers/ConsumerHandler';
import ProsumerHandler from '../handlers/ProsumerHandler';
import ManagerHandler from '../handlers/ManagerHandler';
import Manager from "./manager";
import DefaultNode from "./defaultnode";
import { IComponent } from './node';

export default class Grid {
    private _nodes: Node[][]
    width: number
    height: number
    id: string

    constructor(width?: number, height?: number, id?: string) {
        this.id = id ? id: Types.ObjectId().toHexString();
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

    public balance() {
        // The rules: 
        // * a node takes only from the cheapest source if it is available
        // * a manager on a node can only set the price, production of prosumers sells only as the cheapest
        // * all Nodes must supply demand, if a grid does not have supply then a future implementation will add region sharing of energy.
        // TODO fix simulation so that it can extract pricing information on how much a consumer, prosumer is costing, aswell as data for manager on how much money they are earning
        // TODO add datamonitors

        const consumers = ConsumerHandler.instance.getConsumers() as IComponent[];
        const prosumers = Array.from(ProsumerHandler.Instance.getAll().values());
        consumers.concat(prosumers as IComponent[]);

        const managers = ManagerHandler.Instance.getAll();
        const producers = (prosumers as IProducer[]).concat(managers as IProducer[]); //TODO fix prosumers becomes competitive aswell, fix after pricing for prosumer is added, also make strukure for producers

        producers.sort((fst: IProducer, snd : IProducer) => fst.price - snd.price);

        //TODO Datamonitor
        //knapsack to opt
        //rough algorithm to improve, complexity O(P * D), P nr of producers (which is asymtopically small), D nr of demanders (Large number)
        let demander = consumers.pop();
        let provider = producers.pop();
        //inb4 hell of fixing
        //no more demand? done, no more supply? done
        while(demander && provider){
            let supply = provider!.output - provider!.demand;
            //demander has demand, provider exist and there is supply
            while(demander && provider && supply > 0){
                let take = supply - demander.demand;
                if(supply! < 0){
                    supply = 0
                    take = demander.demand + supply
                    demander.demand -= take;

                }else{
                    demander.demand = 0;
                    supply -= demander.demand;
                    demander = consumers.pop();
                }   
                provider.output -= take;
            }
            provider = producers.pop();
            
        }


        

    }


    public tick(){
        this._nodes.forEach(col => col.forEach((v:Node) => v.tick(Date.now())));
    }

    public get nodes(){
        return this._nodes;
    }

    public async document(){
        const body = {
            width: this.width,
            height: this.height,
            _id: this.id
        }
        try {
            DB.Models.Grid.findByIdAndUpdate(this.id, body , {upsert : true}).exec();
        } catch (error) {
            console.log(error);
        }
    }
}