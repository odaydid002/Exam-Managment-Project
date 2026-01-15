import api from './app'
import {setMainColor, forceDark, forceLight} from '../hooks/apearance';
  
const authCheck = async () => {
    const res = await api.get('/auth/check')
    return res.data
}

const authLogin = async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token)
    }
    return res.data
}

const authSignup = async (payload) => {
    const res = await api.post('/auth/signup', payload)
    return res.data
}

const refreshToken = async () => {
    const res = await api.get('/auth/refreshToken')
    if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token)
    }
    return res.data
}

const sendOtp = async (email) => {
    const res = await api.post('/auth/send-otp', { email })
    return res.data
}

const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp })
    return res.data
}

const resetPassword = async (email, otp, password, password_confirmation) => {
    const res = await api.post('/auth/reset-password', { email, otp, password, password_confirmation })
    return res.data
}

const logout = () => {
    window.matchMedia('(prefers-color-scheme: dark)').matches ? forceDark() : forceLight();
    setMainColor("#F1504A");
    localStorage.removeItem('token')
}

export { authCheck, authLogin, authSignup, refreshToken, sendOtp, verifyOtp, resetPassword, logout }