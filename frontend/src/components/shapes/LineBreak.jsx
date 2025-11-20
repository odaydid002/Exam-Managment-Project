import React from 'react'

const LineBreak = ({
    w = "100%",
    h = "1px",
    mrg = "0",
    color = "var(--border)",
}
) => {
    const varStyles = {
        width: w,
        margin: mrg,
        backgroundColor: color,
        height: h,
    }
    return (
        <div style={varStyles}></div>
    )
}

export default LineBreak