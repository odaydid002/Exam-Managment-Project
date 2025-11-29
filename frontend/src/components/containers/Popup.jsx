import React, { useState, useEffect } from 'react'

const Popup = ({
    children = null,
    css = "",
    isOpen = false,
    bg = "rgba(0,0,0,0.5)",
    blur = null,
    zIndex = 10000,
    onClose = () => {},
    ...rest
}) => {

    const [open, setOpen] = useState(Boolean(isOpen));

    useEffect(() => {
        setOpen(Boolean(isOpen));
    }, [isOpen]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setOpen(false);
            onClose();
        }
    };

    return (
        <div
            {...rest}
            className={`flex column a-center j-center ${css}`}
            style={{
                transition: 'all 0.3s ease-in-out',
                display: open ? 'flex' : 'none',
                position: 'fixed',
                inset: 0,
                backgroundColor: bg,
                backdropFilter: blur ? `blur(${blur}px)` : undefined,
                zIndex: zIndex,
            }}
            onMouseDown={handleBackdropClick}
            role="dialog"
            aria-hidden={!open}
        >
            {children}
        </div>
    )
}

export default Popup