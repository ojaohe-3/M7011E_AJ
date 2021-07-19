import axios from "axios";
import UserData from "./userdata";


export default function Authenticate(key : string, lvl : number) {
    return async function (req, res, next) { // todo TLS protocols
        const id = req.params.id;
        const token = req.headers.authorization.split(' ')[1];
        if (! token) 
            res.status(403).json({message: 'authentication header required!'});
        
        if (id) {
            const user = await verify(token);
            const credence = getPrivilage(key, user, id, lvl);

            if (credence) {
                next();
            } else {
                res.status(403).json({message: "no access to this endpoint"})
            }

        } else {
           // todo, add Attribute based access control for iterables.
           res.status(403).json({message: 'authentication only valid to an id!'});


        } next();
    }

}

function getPrivilage(key : string, user : UserData, id : string, lvl : number): any {
    console.log(`getting : ${key}, from ${user}. Member to be found ${id}`)
    for (const [k, value] of Object.entries(user)) {
        if (k === key) {
            let res = null;
            value.forEach(v => {
                if(v.id === id && lvl <= v.level)
                    res = v
            });
            return res;
        }
    }
    return null;
}

async function verify(token : string): Promise < UserData > {
    try {
        const data = await (await axios.get(process.env.AUTH_ENDPOINT + '/api/validate', {headers: {'authorization' : 'Bearer '+token}})).data;
        if (data.status) {
            return data.body.data;
        
        }else
            return null;
    } catch (error) {
        console.log(error);
    }
}
