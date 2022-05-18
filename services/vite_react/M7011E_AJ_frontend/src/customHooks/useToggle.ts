import { useState } from 'react'

/**
 * a simple toggle hook that acts like a toogle switch
 *
 * @param defaultValue the starting value
 * @returns
 */
const useToggle = (defaultValue: boolean) => {
    const [value, setValue] = useState(defaultValue)

    function toggleValue(value?: boolean) {
        setValue((currentValue) => (value ? value : !currentValue))
    }

    return [value, toggleValue]
}

export default useToggle
