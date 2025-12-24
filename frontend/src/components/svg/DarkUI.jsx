import React from 'react'

const DarkUI = ({
    selected = false 
}) => {
    return (
    <svg width="188" height="122" viewBox="0 0 188 122" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_579_487)">
        <rect x="2" y="2" width="184" height="118" rx="10" fill="#1C1C1D"/>
        <g clipPath="url(#clip1_579_487)">
        <rect x="11" y="11" width="163" height="114" rx="5" fill="#252728"/>
        <rect x="61" y="47" width="107" height="75" rx="3" fill="#868686" fillOpacity="0.45"/>
        <rect x="150" y="26" width="16" height="7" rx="3" fill="var(--color-main)"/>
        <rect x="131" y="26" width="16" height="7" rx="3" fill="#868686" fillOpacity="0.45"/>
        <rect x="61" y="36" width="29" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
        <g opacity="0.31">
        <rect width="1" height="102" transform="translate(55 20)" fill="#868686" fillOpacity="0.45"/>
        </g>
        <rect x="61" y="26" width="45" height="6" rx="2" fill="#868686" fillOpacity="0.45"/>
        <g opacity="0.26">
        <rect x="10" y="10" width="183" height="10" rx="2" fill="#868686" fillOpacity="0.45"/>
        </g>
            <rect x="23" y="25" width="27" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="17" y="25" width="3" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="17" y="14" width="3" height="3" rx="1.5" fill="var(--color-main)"/>
            <rect x="21" y="14" width="3" height="3" rx="1.5" fill="#FF872C"/>
            <rect x="25" y="14" width="3" height="3" rx="1.5" fill="#4FB6A3"/>
            <rect x="17" y="32" width="3" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="17" y="39" width="3" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="17" y="46" width="3" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="17" y="53" width="3" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="17" y="60" width="3" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="23" y="32" width="27" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="23" y="39" width="27" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="23" y="46" width="27" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="23" y="53" width="27" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
            <rect x="23" y="60" width="27" height="3" rx="1.5" fill="#868686" fillOpacity="0.45"/>
        </g>
        {selected && <>
            <rect x="164" y="4" width="16" height="16" rx="8" fill="var(--color-main)"/>
            <path d="M175.79 10.4391L175.791 10.4402L171.564 15.4282C171.564 15.4282 171.182 16 170.717 16C170.214 16 169.885 15.4282 169.885 15.4282L168.229 13.4362H168.23V13.4352C168.088 13.2803 168 13.0658 168 12.83C168 12.357 168.351 11.9733 168.785 11.9733C169.035 11.9733 169.257 12.1007 169.401 12.2989C169.826 12.811 170.25 13.3226 170.674 13.8347L174.636 9.26689L174.642 9.27271C174.785 9.10464 174.989 9 175.215 9C175.648 9 176 9.38316 176 9.8567C176 10.0818 175.92 10.2858 175.79 10.4391H175.79Z" fill="white"/>
        </>}
        </g>
        <rect x="1" y="1" width="186" height="120" rx="11" stroke="var(--color-main)" strokeWidth={selected?"2":"0"}/>
        <defs>
        <clipPath id="clip0_579_487">
        <rect x="2" y="2" width="184" height="118" rx="10" fill="white"/>
        </clipPath>
        <clipPath id="clip1_579_487">
        <rect x="11" y="11" width="163" height="114" rx="5" fill="white"/>
        </clipPath>
        </defs>
    </svg>
    )
}

export default DarkUI