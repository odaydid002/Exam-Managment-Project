import api from './app'

const getAll = async () => {
  const res = await api.get('/rooms/all')
  return res.data
}

const bulkStore = async (list) => {
  const res = await api.post('/rooms/bulk', list)
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/rooms/add', payload)
  return res.data
}

const get = async (id) => {
  const res = await api.get(`/rooms/${id}`)
  return res.data
}

const update = async (id, payload) => {
  const res = await api.put(`/rooms/edit/${id}`, payload)
  return res.data
}

const remove = async (id) => {
  const res = await api.delete(`/rooms/delete/${id}`)
  return res.data
}

export { getAll, bulkStore, add, get, update, remove }
