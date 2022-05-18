import { useRef } from 'react'

/**
 * a wrapper built to hold the previous value of an item
 *
 * @param value The type to catch its previous value
 * @returns
 */
const usePrevious = <T>(value: T) => {
    const currentRef = useRef(value)
    const previousRef = useRef<T>()

    if (currentRef.current !== value) {
        previousRef.current = currentRef.current
        currentRef.current = value
    }

    return previousRef.current
}

export default usePrevious
