import useAsync from './useAsync'

const DEFAULT_OPTIONS = {
    headers: { 'Content-Type': 'application/json' }
}

/**
 * a wrapper for fetch requests
 *
 * @param url string url
 * @param options a dictionary of options for the fetch request
 * @param dependencies any dependencies for the fetch request
 * @returns
 */
const useFetch = (url: string, options: RequestInit = {}, dependencies: any[] = []) => {
    return useAsync(() => {
        return fetch(url, { ...DEFAULT_OPTIONS, ...options }).then((res) => {
            if (res.ok) return res.json()
            return res.json().then((json) => Promise.reject(json))
        })
    }, dependencies)
}

export default useFetch
