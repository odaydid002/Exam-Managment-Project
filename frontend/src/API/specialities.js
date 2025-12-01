import api from './app'

const getAll = async () => {
  const res = await api.get('/specialities/all')
  return res.data
}

const bulkStore = async (list) => {
  const res = await api.post('/specialities/bulk', list)
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/specialities/add', payload)
  return res.data
}

const get = async (id) => {
  const res = await api.get(`/specialities/${id}`)
  return res.data
}

const update = async (id, payload) => {
  const res = await api.put(`/specialities/edit/${id}`, payload)
  return res.data
}

const remove = async (id) => {
  const res = await api.delete(`/specialities/delete/${id}`)
  return res.data
}

export { getAll, bulkStore, add, get, update, remove }
