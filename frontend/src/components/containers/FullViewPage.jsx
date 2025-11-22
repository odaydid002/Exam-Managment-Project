import React from 'react'
import Eclipse from '../shapes/Eclipse'

import styles from "./containers.module.css"

const FullViewPage = (
    {
        css = "",
        pd = "1em",
        children = null,
        white = false
    }
) => {
    const varStyles = {
        padding: pd,
        margin: 0
    }
    return (
        <div className={`${css} overflow-h full-view-min ${white?styles.bgm:styles.bg} flex column center pos-rel`} style={varStyles}>
            <Eclipse size='calc(1vh + 2vw)' w='calc(15vw + 3vh)' top="10%" left="30%" css='pos-abs h4p anim-float-fast'/>
            <Eclipse size='calc(1vh + 2vw)' w='calc(18vw + 3vh)' top="-10%" left="90%" css='pos-abs h4p anim-float'/>
            <Eclipse size='calc(1vh + 2vw)' w='calc(45vw + 3vh)' top="50%" left="-20%" css='pos-abs h4p'/>
            <Eclipse size='calc(1vh + 2vw)' w='calc(20vw + 3vh)' top="55%" left="60%" css='pos-abs h4p anim-float-slow'/>
            <Eclipse size='calc(4vh + 4vw)' w='calc(60vw + 20vh)' top="-10%" left="50%" css='pos-abs h4pc anim-float-slow'/>
            <Eclipse size='calc(2vh + 3vw)' w='calc(20vw + 20vh)' top="25%" left="-20%" css='pos-abs h4pc anim-float'/>
            <Eclipse size='calc(2vh + 2vw)' w='calc(15vw + 10vh)' top="60%" left="35%" css='pos-abs h4pc anim-float-fast'/>
            <Eclipse size='calc(2vh + 2vw)' w='calc(45vw + 10vh)' top="85%" left="65%" css='pos-abs h4pc anim-float-slow'/>
            {children}
        </div>
    )
}

export default FullViewPage