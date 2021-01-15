
import express = require("express");
import ManagerHandler from "./ManagerHandler";
require('dotenv').config();
const app = express.Router();

app.post('/:id', (req, res)=>{
    const id = req.params.id;
    const data = req.body;
    const manager = ManagerHandler.Instance.getById(id);
    if(manager){
        if(data.ratio)
            manager.ratio = data.ratio;
        manager.status = data.status ? true : false;
        manager.tick();
    }
});

module.exports = app;
