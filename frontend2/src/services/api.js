import axios from 'axios'

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
})

API.interceptors.request.use((req) => {
  const adminToken = sessionStorage.getItem('admin_token')
  const userToken = sessionStorage.getItem('token')
  const token = (req.url.includes('/admin') && adminToken) ? adminToken : (userToken || adminToken)
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

export default API