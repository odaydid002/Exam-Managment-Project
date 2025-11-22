import React from 'react'

import styles from './containers.module.css'

const FeatureCard3 = (
    {
        css = "",
        mrg = "0",
        textColor = "var(--text)",
        title = "",
        desc = ""
    }
) => {
    const  varStyles = {
        margin: mrg
    }
    return (
        <div className={`${css} ${styles.card3} flex column`} style={varStyles}>
            <p className='font-bold text-l' style={{color: textColor}}>{title}</p>
            <p className=' text-m' style={{color: "var(--text-low)"}}>{desc}</p>
        </div>
    )
}

export default FeatureCard3