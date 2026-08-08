import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

export const masterAPI = {
  getAll:    ()       => api.get('/master'),
  getOne:    (id)     => api.get(`/master/${id}`),
  create:    (data)   => api.post('/master', data),
  update:    (id, data) => api.put(`/master/${id}`, data),
  remove:    (id)     => api.delete(`/master/${id}`),
}

export const transaksiAPI = {
  getAll:    ()       => api.get('/transaksi'),
  getOne:    (id)     => api.get(`/transaksi/${id}`),
  create:    (data)   => api.post('/transaksi', data),
  update:    (id, data) => api.put(`/transaksi/${id}`, data),
  remove:    (id)     => api.delete(`/transaksi/${id}`),
}

export default api
