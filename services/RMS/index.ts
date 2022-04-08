import axios from "axios";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import FileHander, { IFile } from "./FileHandler";

const handler = FileHander.instance;
const dotenv = require("dotenv");
dotenv.config();

declare interface ResponseError extends Error {
  status?: number
}

const app : Application = express();

const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'X-Access-Token',
  ],
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: process.env.API_URL || 'localhost',
  preflightContinue: false,
}

app.use(cors(options));


app.use(express.json());
app.use(express.urlencoded({
  extended: false
}))



const logger = (req : Request, res: Response, next : NextFunction) => {
  console.log(
    `${(new Date()).toISOString()} :${req.protocol}://${req.get("host")}${req.originalUrl}: got  ${req.method}`
  );
  next();
};
app.use(logger);

app.get('/api/assets/profile/:id', async (req : Request, res : Response) => {

    try {
        const id = req.params.id as string | undefined;
        const token = req.headers.authorization!.split(' ')[1];
        if (!token)
            throw new Error('request require authentication!')

        const user = await verify(token);
        if(user){
            const data = handler.getFile(user!._id);
            res.type('image/png');
            res.send(data);
        }else{
            throw new Error('Invalid Authentication');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error});
    }
})

app.post('/api/assets/profile/:id', async (req : Request, res : Response) => {
    res.type('image/png');
    try {
        const id = req.params.id as string | undefined;
        const token = req.headers.authorization!.split(' ')[1];
        if (!token)
            throw new Error('request require authentication!')

        const user = await verify(token);
        if(user){
            const data : any = req.body;
            console.log(data);
            handler.insert({id: user._id, data: data})
        }else{
            throw new Error('Invalid Authentication');
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({message: error});
    }
})
interface Privilage {
    level: Number,
    access?: string,
    id: string
}
interface UserData {
    username: string,
    main?: string,
    managers?: Array < Privilage >,
    prosumers?: Array < Privilage >,
    consumers?: Array < string >,
    admin: boolean,
    _id: string,
    last_login?: Date
}

async function verify(token: string): Promise<UserData | null> {
    try {
        const data = await (await axios.get(process.env.AUTH_ENDPOINT + '/api/validate', { headers: { 'authorization': 'Bearer ' + token } })).data; // what did i do here???
        return data.body.data;


    } catch (error) {
        console.log(error);
        return null;
    }
}
