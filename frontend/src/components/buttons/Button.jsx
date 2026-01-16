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
  authorized = true,
  isLoading = false,
  mrg = "0",
  classes = "",
  pd="0.4rem 1em",
}) => {
  return (
    <button
      type={type}
      title={!authorized?"Not Authorized":text}
      onClick={authorized?onClick:()=>{}}
      disabled = {isLoading || !authorized}
      className={`flex row a-center j-center ease-in-out pos-rel overflow-h ${styles.bt} ${classes}`}
      style={{
        width: w,
        margin: mrg,
        padding: pd,
        border: "none",
        backgroundColor: bg,
      }}>
        {
          !authorized && <div className='pos-abs pos-center flex center' style={{
            width: "1000px",
            height: "1000px",
            backgroundColor: "rgba(0,0,0,0.3)",
            cursor: "default",
            zIndex: "10"
          }}>

            <i className='fa-solid fa-lock' style={{
              opacity: "0.6",
              color: "var(--text)"
            }}></i>
          </div>
        }
        {icon && <i className={`${icon} ${styles.icon}`} style={{color: color}}></i>}
        {text && <p className={styles.text} style={{color: color}}>{text}</p>}
    </button>
  );
};

export default Button;
