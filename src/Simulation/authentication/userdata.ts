
declare interface Privilage {
    level: Number,
    access?: String,
    id: String
}
export default interface UserData {
    username: String,
    main: String,
    managers?: Array < Privilage >,
    prosumers?: Array < Privilage >,
    consumers?: Array < string >,
    last_login?: Date
}