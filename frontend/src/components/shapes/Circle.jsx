import React from 'react'

const Circle = ({
    active = false,
    clickable = false,
    color = "var(--color-main)",
    size = "25px",
    onClick = () =>{}
}) => {
    return (
        <div className={`flex center ${clickable && "clickable"}`} onClick={onClick} style={{
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: `50%`
        }}>
            <div style={{
                backgroundColor: color,
                width: `calc(${size} - 2px)`,
                height: `calc(${size} - 2px)`,
                borderRadius: `50%`,
                border: active? "2px solid var(--bgc)" : "none"
            }}></div>
        </div>
    )
}

export default Circle