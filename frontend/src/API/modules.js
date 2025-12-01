import api from './app'

const getAll = async () => {
  const res = await api.get('/modules/all')
  return res.data
}

const bulkStore = async (list) => {
  const res = await api.post('/modules/bulk', list)
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/modules/add', payload)
  return res.data
}

const get = async (code) => {
  const res = await api.get(`/modules/${code}`)
  return res.data
}

const update = async (code, payload) => {
  const res = await api.put(`/modules/edit/${code}`, payload)
  return res.data
}

const remove = async (code) => {
  const res = await api.delete(`/modules/delete/${code}`)
  return res.data
}

export { getAll, bulkStore, add, get, update, remove }
