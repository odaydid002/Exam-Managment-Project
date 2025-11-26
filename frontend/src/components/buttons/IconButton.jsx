import React from 'react';
import styles from './buttons.module.css';

const IconButton = ({
  type = "button",
  icon = "",
  color = "var(--text)",
  onClick = () => {},
  size = "var(--text-m)",
  mrg = "0",
  css = "",
  width = "fit-content",
  enabled = true,
}) => {

  const varStyles = {
    fontSize: size,
    textAlign: "center",
    margin: mrg,
    width: width,
    hieght: 'auto',
    aspectRatio: "1"
  };

  return (
    <button
      disabled = {!enabled}
      type={type}
      onClick={onClick}
      className={`flex row center ease-in-out ${styles.iconBt} ${css} ${enabled && "clickable"}`}
      style={varStyles}>
        <i style={{color: color, fontSize: size}} className={`${icon}`}></i>
    </button>
  );
};

export default IconButton;
