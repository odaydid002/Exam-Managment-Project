import api from './app'

const getAll = async (params) => {
  const res = await api.get('/sections/all', { params })
  return res.data
}

const get = async (id) => {
  const res = await api.get(`/sections/${id}`)
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/sections/add', payload)
  return res.data
}

const update = async (id, payload) => {
  const res = await api.put(`/sections/edit/${id}`, payload)
  return res.data
}

const remove = async (id) => {
  const res = await api.delete(`/sections/delete/${id}`)
  return res.data
}

export { getAll, get, add, update, remove }
