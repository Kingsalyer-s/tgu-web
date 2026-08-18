<template>
    <header class="top-bar">
        <div class="top-bar-inner">
            <router-link to="/" class="brand">
                <img src="/logo.jpg" alt="Logo" class="brand-logo">
            </router-link>
            <div class="top-actions">
                <!-- 搜索：点击按钮横向展开输入框 -->
                <div class="search-inline" :class="{ open: showSearch }" v-click-outside="onOutside">
                    <input
                        ref="inputRef"
                        v-model="searchKey"
                        class="search-input"
                        placeholder="搜索非遗项目、资讯、课程..."
                        @keyup.enter="doSearch"
                        @keyup.esc="closeSearch"
                    >
                    <button class="icon-btn" @click="onSearchBtn" :title="showSearch ? '搜索/收起' : '搜索'">
                        <el-icon :size="18"><Search /></el-icon>
                    </button>
                </div>

                <div class="datetime">
                    <span>{{ dateStr }}</span>
                    <span>{{ weekStr }}</span>
                    <span class="lunar">{{ lunarStr }}</span>
                </div>

                <div class="user-menu">
                    <template v-if="userStore.isLoggedIn">
                        <router-link :to="userHome" class="user-name">
                            <el-icon :size="14" style="vertical-align: -2px;"><User /></el-icon>
                            {{ userStore.info?.username }}
                        </router-link>
                        <router-link v-if="isAdmin" to="/admin/dashboard">后台</router-link>
                        <router-link v-else to="/profile">个人中心</router-link>
                        <a href="#" @click.prevent="onLogout">退出</a>
                    </template>
                    <template v-else>
                        <router-link to="/admin/login">登录</router-link>
                        <router-link to="/admin/login?mode=register">注册</router-link>
                    </template>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDatetime } from '@/composables/useDatetime'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const searchKey = ref('')
const showSearch = ref(false)
const inputRef = ref(null)
const { dateStr, weekStr, lunarStr } = useDatetime()

const isAdmin = computed(() => userStore.info?.role === 'admin')
const userHome = computed(() => isAdmin.value ? '/admin/dashboard' : '/profile')

const onLogout = () => {
    userStore.logout()
    ElMessage.success('已退出登录')
    if (router.currentRoute.value.path.startsWith('/admin')) router.push('/')
}

const openSearch = async () => {
    showSearch.value = true
    await nextTick()
    inputRef.value?.focus()
}
const closeSearch = () => {
    showSearch.value = false
    searchKey.value = ''
}
const doSearch = () => {
    const q = searchKey.value.trim()
    if (!q) { closeSearch(); return }
    router.push({ path: '/search', query: { q } })
    closeSearch()
}
const onSearchBtn = () => {
    if (!showSearch.value) return openSearch()
    if (searchKey.value.trim()) return doSearch()
    closeSearch()
}
const onOutside = () => { if (showSearch.value && !searchKey.value) closeSearch() }

// 极简版 v-click-outside 指令
const vClickOutside = {
    mounted(el, binding) {
        el._clickOutside = e => { if (!el.contains(e.target)) binding.value?.(e) }
        document.addEventListener('mousedown', el._clickOutside)
    },
    unmounted(el) { document.removeEventListener('mousedown', el._clickOutside) }
}
</script>

<style scoped>
.search-inline {
    display: flex;
    align-items: center;
    gap: 6px;
}
.search-input {
    height: 36px;
    width: 0;
    padding: 0;
    border: none;
    outline: none;
    background: rgba(255,255,255,.12);
    color: #fff;
    border-radius: 18px;
    font-size: 14px;
    opacity: 0;
    transition: width .35s cubic-bezier(.2,.9,.3,1), padding .35s, opacity .3s;
}
.search-input::placeholder { color: rgba(255,255,255,.55); }
.search-inline.open .search-input {
    width: 280px;
    padding: 0 16px;
    opacity: 1;
    background: rgba(255,255,255,.18);
}
.search-inline.open .search-input:focus {
    background: rgba(255,255,255,.24);
}
</style>
