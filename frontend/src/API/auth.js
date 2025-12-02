import api from './app'
  
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


const logout = () => {
    localStorage.removeItem('token')
}

export { authCheck, authLogin, authSignup, refreshToken, logout }