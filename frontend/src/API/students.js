import api from './app'

const getAll = async (params) => {
  const res = await api.get('/students/all', { params })
  return res.data
}

const get = async (identifier) => {
  const res = await api.get(`/students/${identifier}`)
  return res.data
}

const bulkStore = async (list) => {
  const res = await api.post('/students/bulk', list)
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/students/add', payload)
  return res.data
}

const update = async (number, payload) => {
  const res = await api.put(`/students/edit/${number}`, payload)
  return res.data
}

const remove = async (number) => {
  const res = await api.delete(`/students/delete/${number}`)
  return res.data
}

export { getAll, get, bulkStore, add, update, remove }
