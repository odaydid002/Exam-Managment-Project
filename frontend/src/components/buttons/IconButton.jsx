import React from 'react';
import styles from './buttons.module.css';

const IconButton = ({
  type = "button",
  icon = "",
  onClick = () => {},
  w = "max-content",
  mrg = "0",
  classes = "",
}) => {

  const varStyles = {
    width: w,
    textAlign: "center",
    margin: mrg,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex row center ease-in-out ${styles.bt} ${styles.bgless} ${classes}`}
      style={varStyles}>
        <i className={`${icon} ${styles.icon}`}></i>
    </button>
  );
};

export default IconButton;
