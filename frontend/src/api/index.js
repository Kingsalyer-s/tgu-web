import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
    baseURL: '/api',
    timeout: 15000
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    res => res.data,
    err => {
        const status = err.response?.status
        const msg = err.response?.data?.message || err.message || '请求失败'
        // 401 由服务端拒绝 → 清 token 跳登录
        if (status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            ElMessage.error(msg)
            if (!location.pathname.startsWith('/admin/login')) {
                location.href = '/admin/login?redirect=' + encodeURIComponent(location.pathname)
            }
            return Promise.reject(err)
        }
        // 403 权限不足（非管理员访问管理接口）→ 提示并可选跳走
        if (status === 403) {
            ElMessage.error('权限不足：' + msg)
            if (location.pathname.startsWith('/admin')) location.href = '/'
            return Promise.reject(err)
        }
        ElMessage.error(msg)
        return Promise.reject(err)
    }
)

export const auth = {
    login: data => api.post('/auth/login', data),
    register: data => api.post('/auth/register', data),
    me: () => api.get('/auth/me')
}

export const articles = {
    list: params => api.get('/articles', { params }),
    get: id => api.get(`/articles/${id}`),
    create: data => api.post('/articles', data),
    update: (id, data) => api.put(`/articles/${id}`, data),
    remove: id => api.delete(`/articles/${id}`),
    stats: () => api.get('/articles/stats/summary')
}

export const categories = {
    list: () => api.get('/categories')
}

export const upload = {
    image: formData => api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export default api
