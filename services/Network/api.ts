import { Router, Request, Response } from "express";
import Authenticate from "./authentication/authenticator";
import NetworkHandler from "./handler/NetworkHandler";
import Network, { INetwork } from "./models/network";

const app = Router();
const net = NetworkHandler.instance;
net.fetchAll();
app.get('/', async (req: Request, res: Response) => {
    await net.fetchAll();
    res.json(net.getAll());
})
app.post('/', Authenticate("admin"), (req: Request, res: Response) => {
    try {
        const data: Partial<INetwork> = req.body;
        net.addNet(data);
        res.json({message: "success!"})
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error when trying to post an invalid format', error: error })
    }
})
app.delete('/:id',Authenticate("admin"),(req: Request, res: Response)=> {
    try {
        const id = req.params.id;
        net.deleteNet(id);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Could not parse id', error: error })
    }
})
app.get('/:id',(req: Request, res: Response) => {
    const id = req.params.id;
    const member = net.get(id);
    if(member){
        res.json(member);
    }else{
        res.status(404).json({message: "not found", status: 404})
    }
})
export default app;