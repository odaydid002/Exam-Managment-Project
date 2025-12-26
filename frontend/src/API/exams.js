import api from './app'

const getAll = async (params) => {
  const res = await api.get('/exams/all', { params })
  return res.data
}

const bulkStore = async (list) => {
  const res = await api.post('/exams/bulk', list)
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/exams/add', payload)
  return res.data
}

const get = async (id) => {
  const res = await api.get(`/exams/${id}`)
  return res.data
}

const update = async (id, payload) => {
  const res = await api.put(`/exams/edit/${id}`, payload)
  return res.data
}

const remove = async (id) => {
  const res = await api.delete(`/exams/delete/${id}`)
  return res.data
}

const validateExam = async (id, payload) => {
  const res = await api.put(`/exams/${id}/validate`, payload)
  return res.data
}

export { getAll, bulkStore, add, get, update, remove, validateExam }
