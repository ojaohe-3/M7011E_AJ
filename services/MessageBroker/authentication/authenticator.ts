import assert = require("assert");
import https from "https"
import axios from "axios";
import UserData from "./userdata";

export default function Authenticate(key: string, lvl?: number) {
    return async function (req, res, next) { // todo TLS protocols
        try {
            const id = req.params.id as string | undefined;
            const token = req.headers.authorization.split(' ')[1];

            if (!token)
                res.status(403).json({ message: 'authentication header required!' });

            const user = await verify(token);
            if (!user) {
                res.status(403).json({ message: 'invalid token!' })
            }
            const credence = isPrivilaged(key, user!, id, lvl);

            if (credence) {
                next();
            } else {
                res.status(403).json({ message: "no access to this endpoint" })
            }
        } catch (error) {
            res.status(500).json({ message: "error validating token", error: error })
        }
    }

}

function isPrivilaged(key: string, user: UserData, id?: string, lvl?: number): boolean {
    if(key === "admin"){
        return user.admin;
    }

    console.log(`getting : ${key}, from ${user}. Member to be found ${id}`)
    for (const [k, value] of Object.entries(user)) {
        if (k === key) {
            if (key === "admin") return value;
            if (!lvl || !id) return false;
            value.filter((v) => v.id === id && lvl <= v.level)
            return value.length > 0;
        }
    }
    return false;
}

async function verify(token: string): Promise<UserData | undefined> {
    try {
        const fs = require('fs');
        const httpsAgent = new https.Agent({
            cert: fs.readFileSync("./net.crt"),
            key: fs.readFileSync("./net.key"),
            rejectUnauthorized: false // NOTE: this will disable client verification
        })
        const data = (await axios.get(process.env.AUTH_ENDPOINT + '/api/validate', { headers: { 'authorization': 'Bearer ' + token }, httpsAgent })).data;
        assert(data.status)
        return data.body.data;


    } catch (error) {
        console.log(error);
        return undefined;
    }
}
