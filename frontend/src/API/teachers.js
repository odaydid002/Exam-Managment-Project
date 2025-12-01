import api from './app'

const getAll = async () => {
  const res = await api.get('/teachers/all')
  return res.data
}

const get = async (identifier) => {
  const res = await api.get(`/teachers/${identifier}`)
  return res.data
}

const bulkStore = async (list) => {
  const res = await api.post('/teachers/bulk', list)
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/teachers/add', payload)
  return res.data
}

const update = async (number, payload) => {
  const res = await api.put(`/teachers/edit/${number}`, payload)
  return res.data
}

const remove = async (number) => {
  const res = await api.delete(`/teachers/delete/${number}`)
  return res.data
}

export { getAll, get, bulkStore, add, update, remove }
