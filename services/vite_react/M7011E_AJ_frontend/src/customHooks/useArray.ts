import { useState } from 'react'
/**
 * a wrapper usage for arrays
 *
 * @param defaultValue an array of elements : default is []
 * @returns
 */
const useArray = <T>(defaultValue: T[] = []) => {
    const [array, setArray] = useState(defaultValue)

    function push(element: T) {
        setArray((a) => [...a, element])
    }

    function filter(callback: () => boolean) {
        setArray((a) => a.filter(callback))
    }

    function update(index: number, newElement: T) {
        setArray((a) => [...a.slice(0, index), newElement, ...a.slice(index + 1, a.length - 1)])
    }

    function remove(index: number) {
        setArray((a) => [...a.slice(0, index), ...a.slice(index + 1, a.length - 1)])
    }

    function clear() {
        setArray([])
    }

    return { array, set: setArray, push, filter, update, remove, clear }
}

export default useArray
