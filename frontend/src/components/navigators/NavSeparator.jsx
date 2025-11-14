import React from 'react'

const NavSeparator = (props) => {

    const styles = {
        width: "100%",
        textAlign: "center",
        marginTop: "auto",
        marginBottom: "0.25em",
        cursor: "default",
        opacity: "0.5"
    }

  return (
    <div style={styles}>
        <p className='text-s c-text'>{props.title}</p>
    </div>
  )
}

export default NavSeparator