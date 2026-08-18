<template>
    <section class="section profile-section">
        <div class="profile-head">
            <el-avatar :size="64" style="background: var(--color-primary); font-size: 24px;">
                {{ (userStore.info?.username || 'U')[0].toUpperCase() }}
            </el-avatar>
            <div class="profile-title">
                <div class="name">{{ userStore.info?.username || '游客' }}</div>
                <div class="role">{{ roleLabel }}</div>
            </div>
            <el-button plain @click="onLogout">退出登录</el-button>
        </div>

        <div class="profile-tabs">
            <el-tabs v-model="active">
                <el-tab-pane label="账户信息" name="info">
                    <el-descriptions :column="1" border style="max-width: 640px;">
                        <el-descriptions-item label="用户 ID">{{ userStore.info?.id }}</el-descriptions-item>
                        <el-descriptions-item label="用户名">{{ userStore.info?.username }}</el-descriptions-item>
                        <el-descriptions-item label="角色">{{ roleLabel }}</el-descriptions-item>
                        <el-descriptions-item label="权限说明">
                            <template v-if="userStore.info?.role === 'admin'">
                                管理员：可访问 CMS 后台（/admin），管理内容、栏目、首页设置等
                            </template>
                            <template v-else>
                                普通用户：可保存个人作品、体验数字仿真、评论互动等
                            </template>
                        </el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>

                <el-tab-pane :label="`我的作品集（${works.length}）`" name="works">
                    <div v-if="!works.length" class="empty">
                        暂无作品。<router-link to="/simulation" style="color: var(--color-primary);">去数字仿真实验室创作 →</router-link>
                    </div>
                    <div v-else class="works-grid">
                        <div v-for="(w, i) in works" :key="i" class="work-item">
                            <img :src="w.dataUrl" :alt="w.name">
                            <div class="work-info">
                                <div class="work-name" :title="w.name">{{ w.name }}</div>
                                <div class="work-meta">{{ formatDate(w.createdAt) }}</div>
                                <div class="work-actions">
                                    <el-button size="small" @click="download(w)">下载</el-button>
                                    <el-button size="small" type="danger" plain @click="remove(i)">删除</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const active = ref('info')
const works = ref([])

const roleLabel = computed(() =>
    userStore.info?.role === 'admin' ? '管理员' : '普通用户'
)

const loadWorks = () => {
    try {
        works.value = JSON.parse(localStorage.getItem('sim_works') || '[]')
    } catch { works.value = [] }
}

const formatDate = t => t ? new Date(t).toLocaleString('zh-CN') : ''

const download = w => {
    const a = document.createElement('a')
    a.href = w.dataUrl
    a.download = `${w.name}.jpg`
    a.click()
}
const remove = i => {
    ElMessageBox.confirm('确定删除这个作品？', '提示', { type: 'warning' })
        .then(() => {
            works.value.splice(i, 1)
            localStorage.setItem('sim_works', JSON.stringify(works.value))
            ElMessage.success('已删除')
        }).catch(() => {})
}
const onLogout = () => {
    userStore.logout()
    ElMessage.success('已退出')
    router.push('/')
}

onMounted(() => {
    if (!userStore.isLoggedIn) {
        router.replace('/admin/login?redirect=/profile')
        return
    }
    loadWorks()
})
</script>

<style scoped>
.profile-section { max-width: 1000px; padding-top: 40px; }
.profile-head {
    display: flex;
    align-items: center;
    gap: 20px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 24px;
}
.profile-title { flex: 1; }
.profile-title .name {
    font-family: var(--font-brush);
    font-size: 22px;
    color: var(--color-primary);
    letter-spacing: 2px;
    font-weight: 700;
}
.profile-title .role {
    font-size: 13px;
    color: var(--color-text-mute);
    margin-top: 4px;
}
.profile-tabs :deep(.el-tabs__item.is-active) {
    color: var(--color-primary);
    font-weight: 600;
}
.profile-tabs :deep(.el-tabs__active-bar) { background: var(--color-primary); }

.empty {
    padding: 60px 20px;
    text-align: center;
    color: var(--color-text-mute);
    font-size: 14px;
}

.works-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    padding: 12px 0;
}
.work-item {
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.work-item img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    background: var(--color-bg);
}
.work-info { padding: 12px; }
.work-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.work-meta {
    font-size: 12px;
    color: var(--color-text-mute);
    margin: 6px 0 10px;
}
.work-actions {
    display: flex;
    gap: 6px;
}
</style>
