import { IComponent } from '../models/node';
import Authenticate from '../authentication/authenticator';
import { assert } from 'console';
import { Router } from 'express';
import Simulator from '../handlers/simulation';


require('dotenv').config();
const app = Router();

app.get('/', (_, res) => {
    res.json(Simulator.instance.getAll());
})

app.get('/:x/:y', (req, res) =>{
    try {
        const x : number = +req.params.x;
        const y : number  = +req.params.y;
        const node = Simulator.instance.getAt(x, y)!;
        res.json(node)
    } catch (e) {
        res.status(404).json({
            message: "Tile Not found",
            error: e,
            status: 404
        })
    }
})
//todo authenticate as admin or something
app.put('/:x/:y', Authenticate("admin"), (req, res) =>{
    try {
        const data = req.body as IComponent
        const x : number = +req.params.x;
        const y : number  = +req.params.y;
        const node = Simulator.instance.getAt(x, y)!;
        assert(node.isDefault())
        Simulator.instance.setAt(x, y, data );

        
        res.json({
            message: "success!",
            data: data,
            at: {x: x, y: y}
        })
    } catch (e) {
        res.status(404).json({
            message: "Tile Not found or tile is not default",
            error: e,
            status: 404
        })
    }
})

export default app;