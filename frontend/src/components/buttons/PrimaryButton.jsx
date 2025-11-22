import React from 'react'
import styles from './buttons.module.css';
import Spinner from '../loaders/Spinner';

const PrimaryButton = ({ 
    type = "button", 
    css = "",
    icon = "",
    text = "", 
    w="max-content",
    mrg="0",
    pd="0.5rem 1em",
    isLoading = false,
    onClick = () => {}}) => {
        const varStyles = {
            width: w,
            margin: mrg,
            padding: pd,
            backgroundColor: `${isLoading?"grey":"var(--color-main)"}`,
            cursor: `${isLoading?"default":"pointer"}`
        }

        return (
            <button 
                disabled = {isLoading}
                type={type} 
                onClick={isLoading?() => {}:onClick} 
                className={`flex row a-center j-center ease-in-out ${styles.bt} ${styles.primary} ${css}`} 
                style={varStyles}>
                    {isLoading && <Spinner mrg='0.2em 0' width='20px' thikness='3px'/>}
                    {icon && !isLoading && <i className={`${icon} ${styles.icon}`}></i>}
                    {text && !isLoading && <p className={styles.text}>{text}</p>}
            </button>
        );
};


export default PrimaryButton