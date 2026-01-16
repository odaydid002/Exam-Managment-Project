import React from 'react'
import styles from './buttons.module.css';
import Spinner from '../loaders/Spinner';

const PrimaryButton = ({ 
    id = null,
    type = "button", 
    css = "",
    icon = "",
    text = "", 
    authorized = true,
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
                id={id}
                title={!authorized?"Not Authorized":text}
                disabled = {isLoading || !authorized}
                type={type} 
                onClick={isLoading?() => {}:authorized?onClick:()=>{}} 
                className={`flex row a-center j-center ease-in-out pos-rel overflow-h ${styles.bt} ${styles.primary} ${css}`} 
                style={varStyles}>
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
                    {isLoading && <Spinner mrg='0.2em 0' width='20px' thikness='3px'/>}
                    {icon && !isLoading && <i className={`${icon} ${styles.icon}`}></i>}
                    {text && !isLoading && <p className={styles.text}>{text}</p>}
            </button>
        );
};


export default PrimaryButton