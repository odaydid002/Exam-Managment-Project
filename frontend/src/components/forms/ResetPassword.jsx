import React, { useRef, useState } from 'react';

import styles from './forms.module.css';

import PrimaryButton from '../buttons/PrimaryButton';
import Logo from '../images/Logo';
import Text from '../text/Text';
import TextButton from '../buttons/TextButton';

import { isEmail } from '../../hooks/valider';

const ResetPassword = ({
    isLoading = false,
    onSubmit = () => { alert('Submit') },
    onRemeber = () => {},
    css = "",
    bg = "transparent",
}) => {

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(null);

    const emailInput = useRef(null);

    const varStyles = {
        backgroundColor: bg,
    };

    const valider = () => {
        if (!isEmail(email)) {
            setEmailError("Invalid email");
            return;
        }
        onSubmit(email);
    };

    const checkMail = () => {
        const value = emailInput.current.value;
        setEmail(value);
        setEmailError(!isEmail(value) ? "Invalid email" : null);
    };

    return (
        <form className={`${css} flex column a-center ${styles.signIn}`} style={varStyles}>
            <div className="mrta h4pc"></div>

            <div className={`flex row a-center ${styles.jst}`}>
                <Logo w='35' wc='fit-content' />
            </div>

            <Text
                text="Forgot your password?"
                size="var(--text-l)"
                w="bold"
                mrg="0.5em 0 0 0"
                color="var(--text)"
                css={`${styles.jst} text-m`}
            />

            <Text 
                text="No worries! Enter your email address and we'll send you a link to reset your password."
                size='0.7rem'
                opacity='0.6'
                align='left'
            />

            <div className="mrta h4p"></div>

            <div className="w100 flex column a-center">
                <label htmlFor="mailInp" style={{ alignSelf: "flex-start" }}>Email</label>
                <p className={`${styles.err} text-s`}>{emailError}</p>

                <div
                    className={`flex row a-center ${styles.inputContainer}`}
                    style={{ border: emailError ? "2px solid rgb(225, 63, 63)" : "none" }}
                >
                    <input
                        placeholder='Enter your email'
                        ref={emailInput}
                        type="email"
                        name="email"
                        id="mailInp"
                        onChange={checkMail}
                    />
                </div>

            </div>

            <div className="mrta h4p"></div>

            <PrimaryButton
                w='100%'
                text='Reset Password'
                onClick={isLoading ? () => {} : valider}
                type='button'
                css='btm'
                isLoading={isLoading}
            />
            <div className="w100 flex row a-center">
                <Text 
                    text="Remeber your password ?"
                    mrg='0 0.5em 0 0'
                    size='var(--text-m)'
                    opacity='0.6'
                    align='left'
                />
                <TextButton text='Sign In' textColor='var(--color-main)' onClick={onRemeber}/>
            </div>
        </form>
    );
};

export default ResetPassword;
