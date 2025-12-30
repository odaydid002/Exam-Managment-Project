import api from './app'

const getByDepartment = async (departmentId) => {
  const res = await api.get(`/departments/${departmentId}/general-settings`)
  return res.data
}

const updateByDepartment = async (departmentId, payload) => {
  const res = await api.put(`/departments/${departmentId}/general-settings`, payload)
  return res.data
}

export { getByDepartment, updateByDepartment }
