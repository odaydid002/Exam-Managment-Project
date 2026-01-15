import React, { useRef, useState } from 'react';

import styles from './forms.module.css';

import PrimaryButton from '../buttons/PrimaryButton';
import Logo from '../images/Logo';
import Text from '../text/Text';
import TextButton from '../buttons/TextButton';
import OTP from '../input/OTP';

const Otp = ({
    isLoading = false,
    email = "",
    onSubmit = () => { alert('Submit') },
    onOtpChange = () => {},
    onBack = () => {},
    css = "",
    bg = "transparent",
}) => {

    const [otpValue, setOtpValue] = useState('');

    const handleOtpChange = (e) => {
        setOtpValue(e.target.value);
        onOtpChange(e.target.value);
    };

    const varStyles = {
        backgroundColor: bg,
        maxWidth: "300px",
        height: "100%"
    };

    return (
        <form className={`${css} flex column a-center full ${styles.signIn}`} style={varStyles}>
            <div className="mrta h4pc"></div>

            <div className={`flex row a-center ${styles.jst}`}>
                <Logo w='35' wc='fit-content' />
            </div>

            <Text
              align='left'
                text="Enter Code"
                size="var(--text-l)"
                w="bold"
                mrg="0.5em 0 0 0"
                color="var(--text)"
                css={`${styles.jst} text-m`}
            />
            <Text 
                text={`A code has been sent to ${email}, if this email exist you’ll recieve a 5 digit code for verification.`}
                size='0.7rem'
                opacity='0.6'
                align='left'
            />

            <div className="mrta h4p"></div>

            <OTP count={5} onchange={handleOtpChange} />

            <div className="mrta h4p"></div>

            <PrimaryButton
                w='100%'
                text='Verify OTP'
                onClick={() => onSubmit(otpValue)}
                type='button'
                css='btm'
                isLoading={isLoading}
            />
            <div className="w100 flex row a-center">
                <Text 
                    text="Didn't receive code?"
                    mrg='0 0.5em 0 0'
                    size='var(--text-m)'
                    opacity='0.6'
                    align='left'
                />
                <TextButton text='Resend' textColor='var(--color-main)' onClick={() => {}} />
            </div>
            <TextButton text='Back' textColor='var(--text-low)' onClick={onBack} />
        </form>
    );
};

export default Otp;
