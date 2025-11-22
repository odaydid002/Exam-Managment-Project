import React from 'react';
import styles from './buttons.module.css';

const Button = ({
  type = "button",
  icon = "",
  text = "",
  onClick = () => {},
  w = "max-content",
  mrg = "0",
  classes = "",
  pd="0.4rem 1em",
}) => {

  const varStyles = {
    width: w,
    margin: mrg,
    padding: pd,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex row a-center j-center ease-in-out ${styles.bt} ${styles.bgless} ${classes}`}
      style={varStyles}>
        {icon && <i className={`${icon} ${styles.icon}`}></i>}
        {text && <p className={styles.text}>{text}</p>}
    </button>
  );
};

export default Button;
