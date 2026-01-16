import React from 'react'
import styles from './buttons.module.css';
import Spinner from '../loaders/Spinner';

const SecondaryButton = ({ 
    id = null,
    type = "button", 
    icon = "", 
    text = "", 
    w="max-content",
    authorized = true,
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
                disabled = {isLoading || !authorized}
                onClick={isLoading?() => {}:authorized?onClick:()=>{}} 
                type={type} 
                title={!authorized?"Not Authorized":text}
                className={`flex row a-center j-center ease-in-out pos-rel overflow-h ${styles.bt} ${styles.second} ${css}`} 
                style={varStyles}>
                    {
                        !authorized && <div className='pos-abs pos-center flex center' style={{
                            width: "1000px",
                            height: "1000px",
                            backgroundColor: "rgba(0,0,0,0.1)",
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
                    {!isLoading && icon && <i className={`${icon} ${styles.icon}`}></i>}
                    {!isLoading && text && <p className={styles.text}>{text}</p>}
            </button>
        );
};


export default SecondaryButton