import React from 'react'

const Landing = ({
    scrollBar = true,
    children = null,
    bgc = "var(--bg)",
    bg = "var(--bg)",
    pd = "0",
    css = "",
}) => {
    const varStyles = {
        backgroundColor: bgc,
        background: bg,
        padding: pd,
    }
    return (
        <div className={`${css} ${scrollBar?"scrollbar":"no-scrollbar"}`} style={varStyles}>
             {children}
        </div>
    )
}

export default Landing