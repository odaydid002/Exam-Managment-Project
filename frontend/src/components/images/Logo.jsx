import React from 'react'
import styles from "./logo.module.css";

const Logo = (
    {
        classes = "",
        wc = "var(--sidebar-width)",
        w = "20",
        h = "auto",
        mrg = "0",
        forceLight = false
    }
) => {
    const varStyle = {
        width: `${w}px`,
        height: `${h}px`,
        margin: mrg,
    }
    return (       
        <div className='flex row center' style={{width:wc}}>
            <svg className={`${classes || ""}`} style={varStyle} xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1" viewBox="0 0 400 400">
                <rect style={{fill: forceLight?"var(--color-second":""}} className={`${styles.st3}`} x="98.31" y="204.03" width="37.83" height="35.14" rx="4.6" ry="4.6"/>
                <rect style={{fill: forceLight?"var(--color-second":""}} className={`${styles.st3}`} x="156.96" y="204.03" width="37.83" height="35.14" rx="4.6" ry="4.6"/>
                <rect style={{fill: forceLight?"var(--color-second":""}} className={`${styles.st3}`} x="98.31" y="261.4" width="37.83" height="35.14" rx="4.6" ry="4.6"/>
                <rect style={{fill: forceLight?"var(--color-second":""}} className={`${styles.st3}`} x="156.96" y="261.4" width="37.83" height="35.14" rx="4.6" ry="4.6"/>
                <path style={{fill: forceLight?"var(--color-second":""}} className={`${styles.st3}`} d="M297.67,99.49l-16.14,6.9v39.4c4.15,1.77,7.07,5.9,7.07,10.7,0,2.98-1.11,5.7-2.99,7.76l6.74,20.36c.56,1.68-.71,3.41-2.47,3.41h-25.73c-1.81,0-3.09-1.74-2.53-3.47l6.53-20.51c-1.74-2.04-2.79-4.66-2.79-7.55,0-4.61,2.69-8.6,6.58-10.46v-35.53l-80.77,34.53c-4.66,1.37-8.61,1.42-11.05.57l-109.61-45.49c-5.76-3.32-6.87-8.58-1.11-11.92l107.32-43.6c2.67-1.54,10.16-1.65,12.84-.11l107.61,43.85c5.77,3.32,4.58,8.41.52,11.16Z"/>
                <path className={`${styles.st2}`} d="M376.64,185.56l.02.02-87.3,94.38s-7.9,10.82-17.49,10.82c-10.4,0-17.18-10.82-17.18-10.82l-34.22-37.69h.02v-.02c-2.93-2.93-4.74-6.99-4.74-11.45,0-8.95,7.25-16.21,16.21-16.21,5.16,0,9.75,2.41,12.73,6.16,8.77,9.69,17.52,19.37,26.28,29.06l81.83-86.43.12.11c2.95-3.18,7.16-5.16,11.84-5.16,8.95,0,16.21,7.25,16.21,16.21,0,4.26-1.65,8.12-4.34,11.02Z"/>
                <path style={{fill: forceLight?"var(--color-second":""}} className={`${styles.st3}`} d="M189.53,154.33c-3.74,1.56-7.96,1.56-11.71,0l-66.51-27.61.15,22.43h-30.76c-16.72,0-30.33,13.6-30.33,30.33v140.41c0,16.75,13.58,30.33,30.33,30.33h228.17c16.73,0,30.33-13.61,30.33-30.33v-70.47l-20.06,20.62v49.84c0,5.65-4.6,10.26-10.26,10.26H80.7c-5.65,0-10.26-4.62-10.26-10.26v-140.41c0-5.66,4.61-10.26,10.26-10.26h53.62v-.17h19.94l-.37.15,101.67-.17.22-42.24"/>
                <path className={`${styles.st0}`} d="M181.62,156.16"/>
                <path className={`${styles.st1}`} d="M563.21,72.23"/>
            </svg>
        </div>
    )
}

export default Logo