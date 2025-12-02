import api from './app'

const getProfile = async (id) => {
  const res = await api.get(`/user/${id}/profile`)
  return res.data
}

const updateProfile = async (id, payload) => {
  const res = await api.put(`/user/${id}/profile`, payload)
  return res.data
}

const deleteAccount = async (id) => {
  const res = await api.delete(`/user/${id}/deleteAccount`)
  return res.data
}

const getNotifications = async () => {
  const res = await api.get('/notifications')
  return res.data
}

const markNotificationsRead = async (payload) => {
  const res = await api.post('/notifications/mark-read', payload)
  return res.data
}

export { getProfile, updateProfile, deleteAccount, getNotifications, markNotificationsRead }
