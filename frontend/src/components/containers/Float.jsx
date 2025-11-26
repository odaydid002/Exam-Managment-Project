import React from 'react'

const Float = ({
    css = "", 
    type = "absolute",
    top=null, 
    bottom = null, 
    left = null, 
    right = null,
    children = null,
    zIndex = 1
}) => {
  return (
    <div className={css} style={{
        position: type,
        top: top,
        right: right,
        bottom: bottom,
        left: left,
        zIndex: zIndex
    }}>{children}</div>
  )
}

export default Float