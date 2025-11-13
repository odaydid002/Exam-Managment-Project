import React from 'react'
import styles from "./navBarContainer.module.css"

const NavbarContainer = (props) => {
  return (
    <div className={`${props.classes}`} style={styles.container}>
      {props.children}
    </div>
  )
}

export default NavbarContainer