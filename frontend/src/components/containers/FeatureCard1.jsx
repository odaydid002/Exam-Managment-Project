import React from 'react';

import styles from "./containers.module.css";
import TextButton from '../buttons/TextButton';

const FeatureCard1 = (
    {
        css = "",
        pd = "",
        mrg = "0",
        icon = null,
        title = "",
        desc = "",
        textColor = "white",
        onClick = () => {}
    }
) => {
    const varStyles = {
        padding: pd,
        margin: mrg
    }
    return (
        <div className={`${css} ${styles.card1} flex column`} style={varStyles}>
            {icon && <div className={`${styles.cardIcon} flex center`}><i className={`${icon}`}></i></div>}
            <p className={styles.cardTitle} style={{color: textColor}}>{title}</p>
            <p className={styles.cardDesc} style={{color: textColor}}>{desc}</p>
            <TextButton text='Learn More >' textColor='var(--color-main)' onClick={onClick}/>
        </div>
    )
}

export default FeatureCard1