import React, { useRef, useState, useEffect, useMemo } from 'react';
import Text from '../text/Text';
import styles from './inputs.module.css'

const OTP = ({
    mrg = "0",
    count = 5,
    height = "2em",
    color = "var(--text)",
    label = null,
    readOnly = false,
    val = undefined,
    value = undefined,
    onchange = (e) => {e},
    disabled = false,
    css = "",
    ...rest
}) => {

    const [otp, setOtp] = useState(() => Array(count).fill(""));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (value !== undefined) {
            const valStr = value.toString();
            const newOtp = valStr.split('').slice(0, count);
            while (newOtp.length < count) newOtp.push("");
            setOtp(newOtp);
        } else if (val !== undefined) {
            const valStr = val.toString();
            const newOtp = valStr.split('').slice(0, count);
            while (newOtp.length < count) newOtp.push("");
            setOtp(newOtp);
        }
    }, [value, val, count]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < count - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Call onchange with full OTP
        const fullOtp = newOtp.join('');
        onchange({ target: { value: fullOtp } });
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('').slice(0, count);
        const newOtp = [...otp];
        pasteArray.forEach((char, i) => {
            if (!isNaN(char)) newOtp[i] = char;
        });
        setOtp(newOtp);
        const fullOtp = newOtp.join('');
        onchange({ target: { value: fullOtp } });
    };

    return (
        <>
            <div className={`${css} flex column`} style={{margin: mrg, height: "fit-content" }}>
                {label && (
                    <label style={{ margin: "0.5em 0" }}>
                        <Text 
                            text={label} 
                            color='var(--text-low)'
                            size='var(--text-m)' 
                            opacity='0.8' 
                            align='left'
                        />
                    </label>
                )}
                <div className={`flex row a-center gap`}>
                    {otp.map((digit, index) => (
                        <input
                            className={styles.otpInput}
                            key={index}
                            ref={(el) => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            disabled={disabled || readOnly}
                            style={{
                                height: height,
                                width: height,
                                textAlign: 'center',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                fontSize: '1.2em',
                                backgroundColor: 'transparent',
                                color: color
                            }}
                            {...rest}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default OTP;
