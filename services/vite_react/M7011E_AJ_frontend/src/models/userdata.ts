
export interface Privilage {
    level: number,
    access?: string,
    id: string,
    type: string,
}
export default interface UserData {
    username: string,
    main?: string,
    managers?: Array < Privilage >,
    prosumers?: Array < Privilage >,
    consumers?: Array < string >,
    // admin: boolean,
    last_login?: Date
    token :string
}