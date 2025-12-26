import React from 'react';
import styles from './buttons.module.css';

const TextButton = ({
  type = "button",
  text = "",
  onClick = () => {},
  w = "max-content",
  mrg = "0",
  classes = "",
  underline = false,
  icon = null,
  textColor = "var(--text)"
}) => {

  const varStyles = {
    width: w,
    margin: mrg,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex row a-center j-center ease-in-out clickable ${styles.bText} ${classes}`}
      style={varStyles}>
        <div className='flex row a-center gap'>
          {icon && <i className={`${icon}`} style={{color: textColor, fontSize: "var(--text-m)"}}/> }
          <p className={styles.text} style={{textDecoration:underline?"underline":"", color: textColor}}>{text}</p>
        </div>
    </button>
  );
};

export default TextButton;
