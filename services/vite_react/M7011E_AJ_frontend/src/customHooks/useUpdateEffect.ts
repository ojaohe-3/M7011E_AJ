import { useEffect, useRef } from 'react'

/**
 * a wrapper for update effect
 *
 * @param callback the effect you want to apply
 * @param dependencies the dependencies we are waiting to apply the effect to
 */
const useUpdateEffect = (callback: () => any, dependencies: any[]) => {
    const firstRenderRef = useRef(true)

    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false
            return
        }
        return callback()
    }, dependencies)
}

export default useUpdateEffect
