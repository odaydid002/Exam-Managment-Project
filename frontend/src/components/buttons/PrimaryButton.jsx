import React from 'react'
import styles from './buttons.module.css';

const PrimaryButton = ({ 
    type = "button", 
    icon = "", text = "", 
    w="max-content",
    mrg="0",
    onClick = () => {}}) => {
        const varStyles = {
            width: w,
            margin: mrg
        }

        return (
            <button 
                type={type} 
                onClick={onClick} 
                className={`flex row a-center j-center ease-in-out ${styles.bt} ${styles.primary}`} 
                style={varStyles}>
                    {icon && <i className={`${icon} ${styles.icon}`}></i>}
                    {text && <p className={styles.text}>{text}</p>}
            </button>
        );
};


export default PrimaryButton