
import express = require("express");
import ManagerHandler from "./ManagerHandler";
require('dotenv').config();
const app = express.Router();

interface format{
    ratio? : number,
    status?: boolean
}

app.put('/:id', (req, res)=>{
    const id = req.params.id;
    const data : format = req.body;
    const manager = ManagerHandler.Instance.getById(id);
    if(manager){
        manager.ratio = data.ratio;
        manager.status = data.status;
        res.json({message: "success!", data: data})
    }else
        res.status(404).json({message: "member not found!"})
});


app.get('/:id', (req, res)=>{
    const id = req.params.id;
    const manager = ManagerHandler.Instance.getById(id);
    if(manager){
        const data : format = {ratio: manager.ratio, status: manager.status}
        res.json(data);
    }else
        res.status(404).json({message: "member not found"});
});

module.exports = app;
