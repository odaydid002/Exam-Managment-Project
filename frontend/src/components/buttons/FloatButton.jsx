import React from 'react'

const FloatButton = (
  {
    mrg = "0",
    width = "30px",
    height = "auto",
    color = null,
    icon = null,
    onClick = () => {}
  }
) => {
  const varStyles = {
    width: width,
    height: height,
    textAlign: "center",
    aspectRatio: "1",
    borderRadius: "5px",
    margin: mrg,
    backgroundColor: color?color:"var(--color-main)"
  };
  return (
    <button className={`borderless`} style={varStyles} onClick={onClick}>
      {icon && <i className={`${icon}`} style={{
        color: color?"var(--text)":"white",
        fontSize: "var(--text-l)"
      }}></i>}
    </button>
  )
}

export default FloatButton