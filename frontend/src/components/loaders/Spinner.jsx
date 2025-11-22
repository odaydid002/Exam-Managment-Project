import React from 'react'

import styles from "./loaders.module.css"

const Spinner = (
    {
        mrg = "1em",
        width = "30px",
        thikness = "5px",
        color = "white",
        css = ""
    }
) => {
    const varStyles = {
        width: width,
        margin: mrg,
        border: `${thikness} solid ${color}`
    }
    return (
        <div style={varStyles} className={`${css} ${styles.loader1}`}></div>
    )
}

export default Spinner