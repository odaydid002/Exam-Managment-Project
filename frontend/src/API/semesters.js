import api from './app'

const getAll = async () => {
  const res = await api.get('/semesters/all')
  // API returns { semesters: [...] } — normalize to plain array
  if (!res || !res.data) return []
  return res.data.semesters || res.data || []
}

export { getAll }
