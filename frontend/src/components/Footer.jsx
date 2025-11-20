import React from 'react'

import styles from './footer.module.css'
import LineBreak from './shapes/LineBreak'
import Logo from "./images/Logo"

const Footer = ({
    facebook = "#",
    instagram = "#",
    github = "#",
    youtube = "#",
    linkedin = "#",
    forceLight = false
}) => {
  return (
    <footer className={`vw100 flex column ${styles.footer}`} style={{zIndex: 2}}>
        <LineBreak w="100%" h="3px" mrg='0' color="var(--border-low)"/>
        <div className="flex row a-center j-spacebet w100 pdv-2">
            <div className="flex row a-center">
                <Logo forceLight={forceLight} wc='fit-content' mrg='0 1em 0 0'/>
                <p className={styles.text}>&copy;2026 PT.Unitime. All rights reserved</p>
            </div>
            <ul className={styles.socialList}>
                <a href={facebook} target='_blank' title='Facebook'>
                    <i className={`fa-brands fa-facebook ${styles.f}`}></i>
                </a>
                <a href={instagram} target='_blank' title='Instagram'>
                    <i className={`fa-brands fa-instagram ${styles.i}`}></i>
                </a>
                <a href={github} target='_blank' title='Github'>
                    <i className={`fa-brands fa-github ${styles.g}`}></i>
                </a>
                <a href={youtube} target='_blank' title='Youtube'>
                    <i className={`fa-brands fa-youtube ${styles.y}`}></i>
                </a>
                <a href={linkedin} target='_blank' title='LinkedIn'>
                    <i className={`fa-brands fa-linkedin ${styles.l}`}></i>
                </a>
            </ul>
        </div>
    </footer>
  )
}

export default Footer