import api from './app'

const getAll = async () => {
  const res = await api.get('/departments/all')
  if (!res || !res.data) return []
  return res.data.departments || res.data || []
}

export { getAll }
