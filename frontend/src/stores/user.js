import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        info: JSON.parse(localStorage.getItem('userInfo') || 'null')
    }),
    getters: {
        isLoggedIn: state => !!state.token
    },
    actions: {
        setAuth(token, info) {
            this.token = token
            this.info = info
            localStorage.setItem('token', token)
            localStorage.setItem('userInfo', JSON.stringify(info))
        },
        logout() {
            this.token = ''
            this.info = null
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
        }
    }
})
