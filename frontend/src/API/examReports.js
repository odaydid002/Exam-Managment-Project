import api from './app'

const getAll = async (params) => {
  const res = await api.get('/exam-reports', { params })
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/exam-reports', payload)
  return res.data
}

const get = async (id) => {
  const res = await api.get(`/exam-reports/${id}`)
  return res.data
}

const update = async (id, payload) => {
  const res = await api.put(`/exam-reports/${id}`, payload)
  return res.data
}

const remove = async (id) => {
  const res = await api.delete(`/exam-reports/${id}`)
  return res.data
}

export { getAll, add, get, update, remove }
