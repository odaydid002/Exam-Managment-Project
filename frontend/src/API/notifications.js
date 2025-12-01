import api from './app'

const getNotifications = async () => {
  const res = await api.get('/notifications')
  return res.data
}

const markNotificationsRead = async (payload = {}) => {
  // payload could be { ids: [...] } or other expected shape
  const res = await api.post('/notifications/mark-read', payload)
  return res.data
}

export { getNotifications, markNotificationsRead }
