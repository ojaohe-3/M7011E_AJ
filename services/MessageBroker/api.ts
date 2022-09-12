import { Router, Request, Response } from "express";
import Authenticate from "./authentication/authenticator";


const app = Router();
app.get('/', async (req: Request, res: Response) => {

})

export default app;