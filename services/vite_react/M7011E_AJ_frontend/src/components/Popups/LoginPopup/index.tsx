import React, { useState } from 'react'
import PopupTemplate from '../template'

export default function LoginPopup() {
    const [active, setActive] = useState(true);

    return (
        <PopupTemplate 
        show={active} 
        onClose={() => useState(false)} 
        size={'lg'} 
        />

    )
}
