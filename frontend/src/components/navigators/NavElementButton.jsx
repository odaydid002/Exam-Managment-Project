import styles from "./navElement.module.css"

const NavElementButton = (props) => {

  return (
    <div onClick={props.onClick} className={`flex row a-center j-center wrap w100 overflow-h ${styles.container}`} style={{ marginTop: `${props.mrt}`}}>
        <div className={`flex column center ${styles.icon}`}>
            <i className={`${props.icon} text-l ${props.hover?styles.hover:""}`}></i>
        </div>
        <p className={`${styles.title}`}>{props.title}</p>
    </div>
  )
}

export default NavElementButton