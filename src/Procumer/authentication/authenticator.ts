import axios from "axios";
import Privilege, { User } from "./Iauth";

export default class Authenticator {
	private static instance: Authenticator;
	private privilege: Privilege;
    private valid_to: Date;
    
    constructor(privilege: Privilege, valid_to: Date){

        this.privilege
        this.valid_to = valid_to;
    }

    public static get Valid(): boolean{
        if(!this.instance)
            return false;
        else
            return this.instance.valid_to.getTime() - Date.now() >= 0;
    }

	public static async Authenticate(token: string, id: string) : Promise<Authenticator>{
		

        try {
           
            if(this.instance.valid_to.getTime() > Date.now()){
                return this.instance;
            }else{

                const OktaJwtVerifier = require("@okta/jwt-verifier");

                const oktaJwtVerifier = new OktaJwtVerifier({
                    issuer: process.env.ISSUER,
                    clientId: process.env.CLIENT_ID,
                });


                const data = await (await axios.get(process.env.LOGIN_API+'/login/'+)).data;
                const res = data.userdata.prosumers.forEach(e => {
                    if(e.id === id){
                        return e;
                    }
                });
                if(res){
                    const data = res[0]; //if we have multiple, first is the only one that matters, since it is undefined behavior
                    this.instance = new Authenticator(data, new Date(Date.now() + 3600*1000));
                    return this.instance;
                }
            }
          } catch (error) {
            console.log(error.message)
          }
        
	}
}
