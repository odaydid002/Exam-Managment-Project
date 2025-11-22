export function isEmail(mail) {
    return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(mail);
}
export function isValidPassword(password) {
    return (/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{9,}$/).test(password);
}

export function checkPasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must include an uppercase letter");
    }

    if (!/\d/.test(password)) {
        errors.push("Password must include a number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("Password must include a special character");
    }

    return errors;
}