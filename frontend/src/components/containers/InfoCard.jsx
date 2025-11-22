import React from 'react'

import styles from "./containers.module.css"
import Text from '../text/Text'

const InfoCard = (
    {
        css = "",
        mrg = "0",
        icon = "",
        iconColor = "grey",
        value = "",
        desc = "",
    }
) => {
    const varStyles = {
        margin: mrg,
    }
    return (
        <div className={`${css} ${styles.infoCard} flex center`} style={varStyles}>
            {icon && 
                <div className="flex center fit pos-rel mrr-2">
                    <i className={`${icon}`} style={{color: iconColor, fontSize: 'var(--text-l)'}}></i>
                    <div className={`${styles.iconBg} rounded-full pos-abs pos-center`} style={{backgroundColor: iconColor}}></div>
            </div>}
            <div className="flex column">
                <Text align='left' size='var(--text-m)' text={value} color='var(--text)'/>
                <Text align='left' size='var(--text-s)' text={desc} color='var(--text-low)'/>
            </div>
        </div>
    )
}

export default InfoCard