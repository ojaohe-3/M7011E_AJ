import { useCallback, useEffect, useState } from 'react'

/**
 * a wrapper for working with async calls
 * 
 * @param callback callback function to perform after the async call
 * @param dependencies any dependencies that the async will wait for
 * @returns 
 */
const useAsync = (callback: () => Promise<any>, dependencies: any[] = []) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState()
    const [value, setValue] = useState()

    const callbackMemoized = useCallback(() => {
        setLoading(true)
        setError(undefined)
        setValue(undefined)
        callback()
            .then(setValue)
            .catch(setError)
            .finally(() => setLoading(false))
    }, dependencies)

    useEffect(() => {
        callbackMemoized()
    }, [callbackMemoized])

    return { loading, error, value }
}

export default useAsync