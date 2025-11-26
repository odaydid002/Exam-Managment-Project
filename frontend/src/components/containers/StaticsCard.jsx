import React from 'react'

import styles from "./containers.module.css"

import Text from '../text/Text'

const StaticsCard = (
    {
        css = "",
        mrg = "0",
        pd = "0",
        title = "",
        value ="0",
        icon = null,
        iconWidth = "45px",
        iconSize = "var(--text-l)",
        iconRound = "8px",
        color = "var(--main-color)",
        bg = "transparent"
    }
) => {
    const varStyles = {
        margin: mrg,
        padding: pd,
        backgroundColor: bg
    }
    return (
        <div style={varStyles} className={`${css} ${styles.staticsCard} flex column`}>
            <Text text={title} color='var(--text-low)' size='var(--text-l)' align='left' opacity='0.5'/>
            <div className="flex row a-center j-spacebet">
                <Text text={value} color='var(--text)' size='var(--text-l)' w='600'/>
                {icon && <div className='flex center' style={{
                    width: iconWidth,
                    height: iconWidth,
                    borderRadius: iconRound,
                    backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`
                }}>
                    <i className={`${icon} ${styles.staticsIcon}`} style={{
                        color: color,
                        fontSize: iconSize
                    }}></i>
                </div>}
            </div>
        </div>
    )
}

export default StaticsCard