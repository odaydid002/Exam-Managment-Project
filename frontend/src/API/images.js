import api from './app'

const imageUrl = (path) => {
  if (!path) return ''
  const base = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '')
  return `${base}/images/${encodeURIComponent(path)}`
}

const upload = async (file) => {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/images/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

export { imageUrl, upload }
