import React from 'react';
import styles from './buttons.module.css';

const Button = ({
  type = "button",
  icon = "",
  text = "",
  bg = "var(--color-main-low)",
  onClick = () => {},
  w = "max-content",
  color = 'var(--color-main)',
  mrg = "0",
  classes = "",
  pd="0.4rem 1em",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex row a-center j-center ease-in-out ${styles.bt} ${classes}`}
      style={{
        width: w,
        margin: mrg,
        padding: pd,
        border: "none",
        backgroundColor: bg,
      }}>
        {icon && <i className={`${icon} ${styles.icon}`} style={{color: color}}></i>}
        {text && <p className={styles.text} style={{color: color}}>{text}</p>}
    </button>
  );
};

export default Button;
