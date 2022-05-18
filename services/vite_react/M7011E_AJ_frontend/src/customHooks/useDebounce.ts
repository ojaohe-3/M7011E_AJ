import { useEffect } from 'react'
import useTimeout from './useTimeout'
/**
 * a react hook that handles debouncing of a function
 *
 * @param callback Function to perform debouncing on
 * @param delay delay in ms : default is 1000ms
 * @param dependencies any dependencies tied to the debouncing
 */
const useDebounce = (callback: () => Promise<void>, delay: number = 1000, dependencies: any[] = []) => {
    const { reset, clear } = useTimeout(callback, delay)
    useEffect(reset, [...dependencies, reset])
    useEffect(clear, [])
}

export default useDebounce