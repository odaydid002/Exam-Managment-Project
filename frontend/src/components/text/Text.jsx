import React from 'react'

const Text = (
    {
        text = "",
        css = "",
        size = "1em",
        color = "var(--text)",
        align = "center",
        mrg = "0",
        high = false,
        pd = high? "0.25em 0.625em": "0",
        w = "400",
        lh = "unset",
        opacity = "1",
        overflow = true,
        ...rest
    }
) => {
    const varStyles = {
        fontSize: size,
        color: color,
        textAlign: align,
        margin: mrg,
        padding: pd,
        fontWeight: w,
        lineHight: lh,
        opacity: opacity,
        borderRadius: "5px",
        backgroundColor: high && "var(--color-main-low)",
    }
    return (
        <h1 {...rest} className={`${css} ${!overflow && "ellipsis"}`} style={varStyles}>{text}</h1>
    )
}

export default Text