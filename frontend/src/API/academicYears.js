import api from './app'

const getAll = async () => {
  const res = await api.get('/academic-years/all')
  if (!res || !res.data) return []
  return res.data.academic_years || res.data || []
}

export { getAll }
