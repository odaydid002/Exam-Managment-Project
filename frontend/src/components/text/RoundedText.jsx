import React from 'react'

const RoundedText = (
    {
        text = "",
        bg = "var(--color-main-low)",
        fontSize = "1rem",
        pd = "0.5em 1em",
        round = "15px",
        css = "",
        textColor = "var(--text)"
    }
) => {
    const varStyles = {
        backgroundColor: bg,
        borderRadius: round,
        padding: pd,
        whiteSpace: 'nowrap',
    }
    return (
    <div style={varStyles} className={`flex row center ${css}`}>
        <p style={{fontSize:fontSize, color:textColor}}>{text}</p>
    </div>
    )
}

export default RoundedText