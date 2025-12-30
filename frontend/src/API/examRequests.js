import api from './app'

const getAll = async (params) => {
  const res = await api.get('/requests/all', { params })
  return res.data
}

const getByTeacher = async (teacherNumber) => {
  const res = await api.get(`/requests/teacher/${teacherNumber}`)
  return res.data
}

const add = async (payload) => {
  const res = await api.post('/requests/add', payload)
  return res.data
}

const approve = async (id) => {
  const res = await api.post(`/requests/${id}/approve`)
  return res.data
}

const reject = async (id) => {
  const res = await api.post(`/requests/${id}/reject`)
  return res.data
}

const remove = async (id) => {
  const res = await api.delete(`/requests/${id}`)
  return res.data
}

export { getAll, getByTeacher, add, approve, reject, remove }
