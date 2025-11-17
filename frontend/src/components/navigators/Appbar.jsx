import React from 'react'
import styles from "./appbar.module.css"

const Appbar = (props) => {
  return (
    <div className={`${styles.container} h4pc flex pdh row a-center full j-around bgc`}>
        {props.children}
    </div>
  )
}

export default Appbar