import { useCallback, useState, useEffect } from 'react'

/**
 * simple warpper for handling storage into an object
 *
 * @param key
 * @param defaultValue
 * @param storageObject
 * @returns
 */
const useStorage = <T>(key: string, defaultValue: T, storageObject: Storage) => {
    const [value, setValue] = useState(() => {
        const jsonValue = storageObject.getItem(key)
        if (jsonValue != null) return JSON.parse(jsonValue)

        if (typeof defaultValue === 'function') {
            return defaultValue()
        } else {
            return defaultValue
        }
    })

    useEffect(() => {
        if (value === undefined) return storageObject.removeItem(key)
        storageObject.setItem(key, JSON.stringify(value))
    }, [key, value, storageObject])

    const remove = useCallback(() => {
        setValue(undefined)
    }, [])

    return [value, setValue, remove]
}

const useLocalStorage = <T>(key: string, defaultValue: T) => {
    return useStorage<T>(key, defaultValue, window.localStorage)
}

const useSessionStorage = <T>(key: string, defaultValue: T) => {
    return useStorage<T>(key, defaultValue, window.sessionStorage)
}

export { useLocalStorage, useSessionStorage }
