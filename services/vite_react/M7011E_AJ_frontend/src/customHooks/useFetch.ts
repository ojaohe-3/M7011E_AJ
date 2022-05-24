import axios from 'axios'
import useAsync from './useAsync'
const header = (token?: string) => { return { headers: { "content-type": "application/json", "Authenticate": token ? `Bearer ${token}` : "" } } }

const get = async (url: string, token: string = "", dependencies: any[] = []) => {
    return useAsync(() => {
        return axios.get(url, header(token)).then((v) => v.data).catch(e => e)

    }, dependencies)
}
const put = (url: string, token: string = "", data: any = {}, dependencies: any[] = []) => {
    return useAsync(() => {
        return axios.put(url, data, header(token)).then((v) => v.data).catch(e => e)

    }, dependencies)
}
const post = <T>(url: string, token: string = "", data: any = {}, dependencies: any[] = []) => {
    return useAsync<T>(() => {
        return axios.post(url, data, header(token)).then((v) => v.data as T).catch(e => e)

    }, dependencies)
}

// const delete_http = (url: string, token: string = "", dependencies: any[] = []) => {
//     return useAsync(() => {
//         return axios.delete(url, header(token)).then((v) => v.data).catch(e => e)

//     }, dependencies)
// }

export default { get, post, put }
