import React, {useRef} from 'react'

const Eclipse = (
    {
        w= "100px",
        top=null,
        bottom=null,
        left=null,
        right=null,
        color= "var(--border-low)",
        size= "10px",
        ref = null,
        zi = "0",
        css = ""
    }
) => {
    const ref1 = useRef(ref)
    const varStyles = {
        width: w,
        height: w,
        top: top,
        left: left,
        bottom: bottom,
        right: right,
        borderRadius: "50%",
        border: `${size} solid ${color}`,
        zIndex: zi
    }
    return (
        <div ref={ref1} className={css} style={varStyles}></div>
    )
}

export default Eclipse