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
        <p className={styles.text} style={{textDecoration:underline?"underline":"", color: textColor}}>{text}</p>
    </button>
  );
};

export default TextButton;
