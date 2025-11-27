import React, { useRef, useState } from 'react';

import styles from './forms.module.css';

import PrimaryButton from '../buttons/PrimaryButton';
import Logo from '../images/Logo';
import Text from '../text/Text';
import TextButton from '../buttons/TextButton';

import { isEmail } from '../../hooks/valider';

const SignIn = ({
    isLoading = false,
    onSubmit = () => { alert('Submit') },
    css = "",
    bg = "transparent",
}) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordHidden, setPasswordHidden] = useState(true);
    const [emailError, setEmailError] = useState(null);

    const emailInput = useRef(null);
    const passwordInput = useRef(null);

    const varStyles = {
        backgroundColor: bg,
    };

    const valider = () => {
        if (!isEmail(email)) {
            setEmailError("Invalid email");
            return;
        }
        onSubmit(email, password);
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
                text="Sign in to your account"
                size="var(--text-l)"
                w="bold"
                mrg="0.5em 0 0 0"
                color="var(--text)"
                css={`${styles.jst} text-m`}
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

                <div className="flex row a-center j-spacebet w100">
                    <label htmlFor="passInp">Password</label>
                    <TextButton text='Forget Password?' textColor='var(--color-main)' />
                </div>

                <div className={`flex row a-center ${styles.inputContainer}`}>
                    <div className="flex row a-center w100">
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Enter your password'
                            ref={passwordInput}
                            type={passwordHidden ? "password" : "text"}
                            name="password"
                            id="passInp"
                        />
                        <i
                            className={`fa-solid ${passwordHidden ? "fa-eye-slash" : "fa-eye"}`}
                            onClick={() => setPasswordHidden(!passwordHidden)}
                        ></i>
                    </div>
                </div>
            </div>

            <div className="mrta h4p"></div>

            <PrimaryButton
                w='100%'
                text='Sign In'
                onClick={isLoading ? () => {} : valider}
                type='button'
                css='btm'
                isLoading={isLoading}
            />
        </form>
    );
};

export default SignIn;
