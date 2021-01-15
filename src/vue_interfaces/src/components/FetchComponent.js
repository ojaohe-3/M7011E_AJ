const axios = require('axios');

export default class FetchComponent{
    
        static _get = async (api, token) =>  await axios.get(api,{
            headers: {
              Authorization: 'Bearer ' + token 
            }
        }).then(res => res.data).catch(err => console.log(err));
            
        static _post = async (api, data, token) =>  await axios.post(api, data,{
            headers:{
                Authorization: 'Bearer ' + token 
            }
        }).then(res => res.data).catch(err => console.log(err)); 
    
}