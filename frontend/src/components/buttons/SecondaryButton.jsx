import React from 'react'
import styles from './buttons.module.css';

const SecondaryButton = ({ 
    type = "button", 
    icon = "", 
    text = "", 
    w="max-content",
    mrg="0",
    onClick = () => {}})=> {
        const varStyles = {
            width: w,
            margin: mrg
        }
        return (
            <button 
                type={type} 
                onClick={onClick} 
                className={`flex row a-center j-center ease-in-out ${styles.bt} ${styles.second}`} 
                style={varStyles}>
                    {icon && <i className={`${icon} ${styles.icon}`}></i>}
                    {text && <p className={styles.text}>{text}</p>}
            </button>
        );
};


export default SecondaryButton