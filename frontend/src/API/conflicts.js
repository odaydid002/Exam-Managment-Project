import api from './app'

const getStats = async () => {
  const res = await api.get('/conflicts/stats')
  return res.data
}

export { getStats }
