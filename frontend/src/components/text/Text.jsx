import React, { Children } from 'react'

const Text = (
    {
        text = "",
        css = "",
        size = "1em",
        color = "var(--text)",
        align = "center",
        mrg = "0",
        pd = "0",
        w = "400",
        lh = "unset"
    }
) => {
    const varStyles = {
        fontSize: size,
        color: color,
        textAlign: align,
        margin: mrg,
        padding: pd,
        fontWeight: w,
        lineHight: lh
    }
    return (
        <h1 className={`${css}`} style={varStyles}>{text}</h1>
    )
}

export default Text