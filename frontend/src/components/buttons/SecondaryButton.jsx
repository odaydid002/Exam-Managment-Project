import React from 'react'
import styles from './buttons.module.css';
import Spinner from '../loaders/Spinner';

const SecondaryButton = ({ 
    id = null,
    type = "button", 
    icon = "", 
    text = "", 
    w="max-content",
    mrg="0",
    pd="0.5rem 1em",
    css = "",
    isLoading = false,
    onClick = () => {}})=> {
        const varStyles = {
            width: w,
            margin: mrg,
            padding: pd,
            cursor: `${isLoading?"default":"pointer"}`
        }
        return (
            <button 
                id = {id}
                disabled = {isLoading}
                onClick={isLoading?() => {}:onClick} 
                type={type} 
                className={`flex row a-center j-center ease-in-out ${styles.bt} ${styles.second} ${css}`} 
                style={varStyles}>
                    {isLoading && <Spinner mrg='0.2em 0' width='20px' thikness='3px'/>}
                    {!isLoading && icon && <i className={`${icon} ${styles.icon}`}></i>}
                    {!isLoading && text && <p className={styles.text}>{text}</p>}
            </button>
        );
};


export default SecondaryButton