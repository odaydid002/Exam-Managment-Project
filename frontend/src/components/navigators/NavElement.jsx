import { NavLink } from 'react-router-dom'

import styles from "./navElement.module.css"

const NavElement = (props) => {

  return (
    <NavLink className={props.icon?({isActive}) => {return isActive?styles.active:""}:""} to={props.path} style={{ textDecoration: "none", marginTop: `${props.mrt}` }}>
        <div className={`flex row a-center j-center wrap w100 overflow-h ${styles.container} ${props.hover?styles.hover:""}`}>
            <div className={`flex column center ${styles.icon}`}>
              {
                props.icon?
                  <i className={`${props.icon} text-l`}></i>:
                  props.children
              }  
            </div>
            <p className={`${styles.title}`}>{props.title}</p>
        </div>
    </NavLink>
  )
}

export default NavElement