import api from './app'

const getAll = async () => {
  const res = await api.get('/groups/all')
  return res.data
}

const bulkStore = async (list) => {
  const res = await api.post('/groups/bulk', list)
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/groups/add', payload)
  return res.data
}

const get = async (code) => {
  const res = await api.get(`/groups/${code}`)
  return res.data
}

const update = async (code, payload) => {
  const res = await api.put(`/groups/edit/${code}`, payload)
  return res.data
}

const remove = async (code) => {
  const res = await api.delete(`/groups/delete/${code}`)
  return res.data
}

// Delegate endpoints
const setDelegate = async (code, payload) => {
  const res = await api.post(`/groups/${code}/delegate/set`, payload)
  return res.data
}

const changeDelegate = async (code, payload) => {
  const res = await api.put(`/groups/${code}/delegate/edit`, payload)
  return res.data
}

const removeDelegate = async (code, payload = {}) => {
  const res = await api.delete(`/groups/${code}/delegate/remove`, { data: payload })
  return res.data
}

export { getAll, bulkStore, add, get, update, remove, setDelegate, changeDelegate, removeDelegate }
