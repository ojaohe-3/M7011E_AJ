
export interface Privilage {
    level: Number,
    access?: string,
    id: string
}
export default interface UserData {
    username: string,
    main?: string,
    managers?: Array < Privilage >,
    prosumers?: Array < Privilage >,
    consumers?: Array < string >,
    // admin: boolean,
    last_login?: Date
}