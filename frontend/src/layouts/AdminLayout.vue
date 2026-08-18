<template>
    <el-container class="admin-layout">
        <el-aside width="240px" class="admin-aside">
            <div class="admin-logo">
                <img src="/logo.jpg" alt="Logo">
                <div>
                    <div class="admin-title">非遗平台</div>
                    <div class="admin-sub">CMS 管理后台</div>
                </div>
            </div>
            <el-menu :default-active="route.path" router class="admin-menu" background-color="#501846" text-color="#f5f1e8" active-text-color="#C9A961">
                <el-menu-item index="/admin/dashboard"><el-icon><DataAnalysis /></el-icon><span>仪表盘</span></el-menu-item>
                <el-menu-item index="/admin/articles"><el-icon><Document /></el-icon><span>内容管理</span></el-menu-item>
                <el-menu-item index="/admin/media"><el-icon><Picture /></el-icon><span>媒体库</span></el-menu-item>
                <el-menu-item index="/admin/categories"><el-icon><Menu /></el-icon><span>栏目管理</span></el-menu-item>
                <el-menu-item index="/admin/homepage"><el-icon><HomeFilled /></el-icon><span>首页设置</span></el-menu-item>
                <el-menu-item index="/admin/users"><el-icon><UserFilled /></el-icon><span>用户管理</span></el-menu-item>
                <el-menu-item index="/admin/logs"><el-icon><Warning /></el-icon><span>登录日志</span></el-menu-item>
                <el-menu-item index="/admin/settings"><el-icon><Setting /></el-icon><span>站点设置</span></el-menu-item>
            </el-menu>
        </el-aside>

        <el-container>
            <el-header class="admin-header">
                <div class="crumb">
                    <router-link to="/">← 返回前台</router-link>
                    <span class="sep">|</span>
                    <span>{{ route.meta.title }}</span>
                </div>
                <div class="admin-user">
                    <el-avatar :size="32" style="background: var(--color-primary);">
                        {{ (userStore.info?.username || 'A')[0].toUpperCase() }}
                    </el-avatar>
                    <el-dropdown @command="onCommand">
                        <span class="user-name">{{ userStore.info?.username || 'admin' }} <el-icon><ArrowDown /></el-icon></span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>

            <el-main class="admin-main">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, Document, Menu, Setting, ArrowDown, HomeFilled, Picture, UserFilled, Warning } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { auth } from '@/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 挂载时向后端校验身份，防止 localStorage 造假绕过路由守卫
onMounted(async () => {
    try {
        const res = await auth.me()
        if (res?.user?.role !== 'admin') {
            ElMessage.error('后台仅限管理员访问')
            userStore.logout()
            router.replace('/')
        }
    } catch {
        // 401/403 已由拦截器处理
    }
})

const onCommand = cmd => {
    if (cmd === 'logout') {
        userStore.logout()
        ElMessage.success('已退出')
        router.push('/admin/login')
    }
}
</script>

<style scoped>
.admin-layout { height: 100vh; }
.admin-aside {
    background: var(--color-primary-dark);
    color: #fff;
    overflow: hidden;
}
.admin-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 20px;
    background: var(--color-primary);
    border-bottom: 1px solid rgba(255,255,255,.1);
}
.admin-logo img {
    width: 40px; height: 40px;
    border-radius: 6px;
    background: #fff;
    padding: 3px;
    flex-shrink: 0;
}
.admin-title {
    font-family: var(--font-brush);
    font-size: 18px;
    letter-spacing: 2px;
    color: #fff;
}
.admin-sub { font-size: 11px; opacity: .8; letter-spacing: 1px; }
.admin-menu {
    border-right: none;
}
.admin-menu :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
}
.admin-menu :deep(.el-menu-item:hover) {
    background: rgba(255,255,255,.06) !important;
}
.admin-menu :deep(.el-menu-item.is-active) {
    background: var(--color-primary) !important;
    border-right: 3px solid var(--color-gold);
}

.admin-header {
    background: #fff;
    box-shadow: 0 1px 6px rgba(0,0,0,.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
}
.crumb {
    font-size: 14px;
    color: var(--color-text-soft);
}
.crumb a { color: var(--color-primary); font-weight: 500; }
.crumb .sep { margin: 0 12px; color: var(--color-border); }
.admin-user {
    display: flex;
    align-items: center;
    gap: 10px;
}
.user-name {
    cursor: pointer;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
}
.admin-main {
    background: #F5F1E8;
    padding: 24px;
    overflow-y: auto;
}
</style>
