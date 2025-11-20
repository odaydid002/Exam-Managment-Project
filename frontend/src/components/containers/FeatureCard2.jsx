import React from 'react';

import styles from "./containers.module.css";
import TextButton from '../buttons/TextButton';

const FeatureCard2 = (
    {
        css = "",
        pd = "",
        mrg = "0",
        icon = null,
        title = "",
        desc = "",
        textColor = "white",
    }
) => {
    const varStyles = {
        padding: pd,
        margin: mrg
    }
    return (
        <div className={`${css} ${styles.card2} flex row`} style={varStyles}>
            {icon && <div className={`${styles.card2Icon} flex center`}><i className={`${icon} cMain text-l`}></i></div>}
            <div className="flex row">
                <p>
                    <span className="text-l font-bold" style={{color: textColor}}>{title}</span>
                    <span className="text-m" style={{color: textColor, marginLeft: "0.5em"}}>{desc}</span>
                </p>
            </div>
        </div>
    )
}

export default FeatureCard2