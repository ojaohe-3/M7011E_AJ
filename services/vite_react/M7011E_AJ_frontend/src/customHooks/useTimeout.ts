import { useCallback, useEffect, useRef } from 'react'

/**
 * a hook wrapper that handles timeouts
 *
 * @param callback the function to timeout
 * @param delay the timeeout delay
 * @returns
 */
const useTimeout = (callback: () => Promise<any>, delay: number) => {
    const callbackRef = useRef(callback)
    const timeoutRef = useRef<number>()

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const set = useCallback(() => {
        timeoutRef.current = setTimeout(() => callbackRef.current(), delay)
    }, [delay])

    const clear = useCallback(() => {
        timeoutRef.current && clearTimeout(timeoutRef.current)
    }, [])

    useEffect(() => {
        set()
        return clear
    }, [delay, set, clear])

    const reset = useCallback(() => {
        clear()
        set()
    }, [clear, set])

    return { reset, set, clear }
}

export default useTimeout