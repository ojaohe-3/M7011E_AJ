import axios from "axios";
import UserData from "./userdata";


export default function Authenticate(key: string, lvl: number){
    return async function (req, res, next) { //todo TLS protocols
        const id = req.params.id;
        try {
        const token = (req.headers.authorization).split(' ')[1];
        if(!token)
            res.status(403).json({message: 'no valid credential'});
            
        if (id) {
            const user = await verify(token);
            const credence = getPrivilage(key, user, id, lvl);

            if(credence){
                next();
            }else{
                res.status(403).json({message: "no access to this endpoint", status : 0})
            }
            
        } else {
            throw new Error("invalid use of Middleware"); //todo, add Attribute based access control for iterables.

        } 
        next();
        } catch (error) {
            res.status(403).json({message: 'authentication header required!'});
        }
        
        
    }
}

function getPrivilage(key : string, user: UserData, id: string, lvl: number): any{
    for(const [k, value] of Object.entries(user)){
        if(k === key){
            for(const item in value){
                console.log(item);
            }
        }
    }
    return null;
}

async function verify(token: string): Promise<UserData>{
    try {
        const data = await (await axios.post(process.env.AUTH_ENDPOINT + '/api/validate', {token: token})).data;
        if(data.status){
            return  data.data;
        }
    } catch (error) {
        return null;
    }
}