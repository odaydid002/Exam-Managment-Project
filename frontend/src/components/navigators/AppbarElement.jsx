import { NavLink } from 'react-router-dom'
import styles from './appbar.module.css'

const AppbarElement = (props) => {

  return (
    <NavLink className={props.icon?({isActive}) => {return isActive?styles.active:""}:""} to={props.path} style={{ textDecoration: "none", marginTop: `${props.mrt}` }}>
        <div className={`flex column a-center j-center ${styles.element}`}>
            {
            props.icon?
                <i className={`${props.icon} text-l`}></i>:
                props.children
            }  
            <p className={`${styles.title}`}>{props.title}</p>
        </div>
    </NavLink>
  )
}

export default AppbarElement