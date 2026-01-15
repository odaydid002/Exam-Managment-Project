import React, { useRef, useState } from 'react';

import styles from './forms.module.css';

import PrimaryButton from '../buttons/PrimaryButton';
import Logo from '../images/Logo';
import Text from '../text/Text';
import TextButton from '../buttons/TextButton';

const ResetPassword = ({
    isLoading = false,
    onSubmit = () => { alert('Submit') },
    css = "",
    bg = "transparent",
}) => {

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState(null);

    const passwordInput = useRef(null);
    const confirmInput = useRef(null);

    const varStyles = {
        backgroundColor: bg,
        maxWidth: "300px",
        height: "100%"
    };

    const valider = () => {
        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        setPasswordError(null);
        onSubmit(password, confirmPassword);
    };

    return (
        <form className={`${css} flex column a-center full ${styles.signIn}`} style={varStyles}>
            <div className="mrta h4pc"></div>

            <div className={`flex row a-center ${styles.jst}`}>
                <Logo w='35' wc='fit-content' />
            </div>

            <Text
                text="Reset Password"
                size="var(--text-l)"
                w="bold"
                mrg="0.5em 0 0 0"
                color="var(--text)"
                css={`${styles.jst} text-m`}
            />
            <Text 
                text="Enter your new password"
                size='0.7rem'
                opacity='0.6'
                align='left'
            />

            <div className="mrta h4p"></div>

            <div className="w100 flex column a-center">
                <label htmlFor="passInp" style={{ alignSelf: "flex-start" }}>New Password</label>
                <p className={`${styles.err} text-s`}>{passwordError}</p>

                <div className={`flex row a-center ${styles.inputContainer}`}>
                    <input
                        placeholder='Enter new password'
                        ref={passwordInput}
                        type="password"
                        name="password"
                        id="passInp"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <label htmlFor="confirmInp" style={{ alignSelf: "flex-start", marginTop: "1em" }}>Confirm Password</label>
                <div className={`flex row a-center ${styles.inputContainer}`}>
                    <input
                        placeholder='Confirm new password'
                        ref={confirmInput}
                        type="password"
                        name="confirmPassword"
                        id="confirmInp"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
        </form>
    );
};

export default ResetPassword;
