export default interface Privilege{
    level: Number,
    access?: String,
    id: String
}

export interface User extends Document{
    username: String,
    clientid: String,
    managers?: Array<Privilege>,
    prosumers?: Array<Privilege>,
    consumers?: Array<string>,
    last_login: Date,
}
