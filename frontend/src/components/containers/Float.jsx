import React from 'react'

const Float = ({
    css = "", 
    type = "absolute",
    top=null, 
    bottom = null, 
    left = null, 
    right = null,
    children = null
}) => {
  return (
    <div className={css} style={{
        position: type,
        top: top,
        right: right,
        bottom: bottom,
        left: left,
    }}>{children}</div>
  )
}

export default Float