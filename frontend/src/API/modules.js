import api from './app'

const getAll = async () => {
  const res = await api.get('/modules/all')
  return res.data
}

const stats = async () => {
  const res = await api.get('/modules/stats')
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

const getByTeacher = async (teacherNumber) => {
  const res = await api.get(`/modules/teacher/${teacherNumber}`)
  // Return consistent shape: { total, modules }
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

const assignTeacher = async (code, payload) => {
  const res = await api.post(`/modules/${code}/assign`, payload)
  return res.data
}

const updateAssignment = async (code, teacherNumber, payload) => {
  const res = await api.put(`/modules/${code}/assign/${teacherNumber}`, payload)
  return res.data
}

const unassignTeacher = async (code, teacherNumber) => {
  const res = await api.delete(`/modules/${code}/assign/${teacherNumber}`)
  return res.data
}

export { getAll, stats, bulkStore, add, get, update, remove, assignTeacher, updateAssignment, unassignTeacher, getByTeacher }
