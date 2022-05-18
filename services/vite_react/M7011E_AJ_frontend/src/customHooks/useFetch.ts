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
    return useAsync(async () => {
        const res = await fetch(url, { ...DEFAULT_OPTIONS, ...options })
        if (res.ok)
            return res.json()
        const json = await res.json()
        return await Promise.reject(json)
    }, dependencies)
}

export default useFetch
