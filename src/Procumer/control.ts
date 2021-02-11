import express = require("express");
import * as dotenv from "dotenv";
import ProsumerHandler from "./ProsumerHandler";
import Authenticate from "./authentication/authenticator";

dotenv.config({path: "./.env"});  

const app = express.Router();

app.get('/:id',Authenticate("prosumers", 5), (req, res)=>{
    const id = req.params.id;
    const procumer = ProsumerHandler.Instance.getById(id);

    res.json({"input_ratio": procumer.input_ratio, "output_ratio": procumer.output_ratio, "status": procumer.status});
});

app.put('/:id', (req, res)=>{
    interface format{
        input_ratio: number,
        output_ratio: number,
        status: boolean,
    }
    try {
        const data : format = req.body;
        const id = req.params.id;
    if(id){
        const procumer = ProsumerHandler.Instance.getById(id);
        if(procumer){   
            procumer.input_ratio = data.input_ratio;
            procumer.output_ratio = data.output_ratio;
            procumer.status = data.status;
            procumer.update();
            res.json({"input_ratio": procumer.input_ratio, "output_ratio": procumer.output_ratio});
        }else{
            res.status(400).json({messsage:"No such memeber! with "+ id});
        }
    }
    } catch (error) {
        res.status(400).json({message: "API error", expected_format: "{input_ratio: number, output_ratio: number, status: boolean}"});
    }
});

module.exports = app;