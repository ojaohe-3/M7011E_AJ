
import express = require("express");
import Authenticate from "../authentication/authenticator";
import ManagerHandler from "../handlers/ManagerHandler";
require('dotenv').config();
const app = express.Router();

interface format{
    ratio? : number,
    status?: boolean,
    price?: number,
}

app.put('/:id', Authenticate('managers', 5), (req, res)=>{
    const id = req.params.id;
    const data : format = req.body;
    const manager = ManagerHandler.Instance.getById(id);
    if(manager){
        manager.ratio = data.ratio ? data.ratio : manager.ratio;
        manager.status = data.status ? data.status : manager.status;
        manager.price = data.price ? data.price : manager.price;
        res.json({message: "success!", data: data})
    }else
        res.status(404).json({message: "member not found!"})
});


app.get('/:id',  Authenticate('managers', 3), (req, res)=>{
    const id = req.params.id;
    const manager = ManagerHandler.Instance.getById(id);
    if(manager){
        const data : format = {ratio: manager.ratio, status: manager.status}
        res.json(data);
    }else
        res.status(404).json({message: "member not found"});
});

module.exports = app;
