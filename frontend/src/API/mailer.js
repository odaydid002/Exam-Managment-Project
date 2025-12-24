import api from './app'

const send = async (payload) => {
  const res = await api.post('/email/send', payload)
  return res.data
}

const sendBulk = async (payload) => {
  const res = await api.post('/email/bulk', payload)
  return res.data
}

const sendToStudents = async (payload) => {
  const res = await api.post('/email/students', payload)
  return res.data
}

const sendToTeachers = async (payload) => {
  const res = await api.post('/email/teachers', payload)
  return res.data
}

const sendToEmployees = async (payload) => {
  const res = await api.post('/email/employees', payload)
  return res.data
}

export { send, sendBulk, sendToStudents, sendToTeachers, sendToEmployees }
