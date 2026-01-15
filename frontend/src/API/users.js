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

const getSettings = async (id) => {
  const res = await api.get(`/user/${id}/settings`)
  return res.data
}

const updateSettings = async (id, payload) => {
  const res = await api.put(`/user/${id}/settings`, payload)
  return res.data
}

const updatePassword = async (id, payload) => {
  const res = await api.put(`/user/${id}/password`, payload)
  return res.data
}

const sendPasswordOtp = async (id) => {
  const res = await api.post(`/user/${id}/password/otp/send`)
  return res.data
}

const verifyPasswordOtp = async (id, payload) => {
  const res = await api.post(`/user/${id}/password/otp/verify`, payload)
  return res.data
}

const setNewbie = async (id, state) => {
  const res = await api.put(`/user/${id}/newbie`, { newbie: state })
  return res.data
}

const getNotificationsByUser = async (userId, params) => {
  const res = await api.get(`/users/${userId}/notifications`, { params })
  return res.data
}

export { getProfile, updateProfile, deleteAccount, getNotifications, markNotificationsRead, getSettings, updateSettings, updatePassword, sendPasswordOtp, verifyPasswordOtp, getNotificationsByUser, setNewbie }

