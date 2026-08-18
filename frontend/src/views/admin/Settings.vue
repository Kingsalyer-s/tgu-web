<template>
    <div class="admin-page">
        <h1 class="page-title">站点设置</h1>
        <el-card class="setting-card">
            <template #header><strong>系统信息</strong></template>
            <el-descriptions :column="1" border>
                <el-descriptions-item label="平台名称">非遗工艺数字化辅助设计与教学平台</el-descriptions-item>
                <el-descriptions-item label="主色调">PANTONE 512C · #74256A · R116 G37 B106</el-descriptions-item>
                <el-descriptions-item label="前端栈">Vue 3 + Vite + Element Plus + Pinia + Vue Router</el-descriptions-item>
                <el-descriptions-item label="后端栈">Node.js + Express + better-sqlite3 + JWT</el-descriptions-item>
                <el-descriptions-item label="当前用户">{{ userStore.info?.username }}（{{ userStore.info?.role }}）</el-descriptions-item>
            </el-descriptions>
        </el-card>

        <el-card class="setting-card" style="margin-top: 16px;">
            <template #header><strong>修改密码</strong></template>
            <el-form label-width="120px" style="max-width: 480px;">
                <el-form-item label="原密码">
                    <el-input type="password" v-model="pwd.old" show-password @keyup.enter="onChangePwd" />
                </el-form-item>
                <el-form-item label="新密码">
                    <el-input type="password" v-model="pwd.next" show-password placeholder="6-60 位" @keyup.enter="onChangePwd" />
                </el-form-item>
                <el-form-item label="确认新密码">
                    <el-input type="password" v-model="pwd.confirm" show-password @keyup.enter="onChangePwd" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="saving" @click="onChangePwd" :disabled="!ready">保存修改</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import api from '@/api'

const userStore = useUserStore()

const pwd = reactive({ old: '', next: '', confirm: '' })
const saving = ref(false)
const ready = computed(() =>
    pwd.old && pwd.next && pwd.next === pwd.confirm && pwd.next.length >= 6
)

const onChangePwd = async () => {
    if (!ready.value) return
    if (pwd.old === pwd.next) {
        ElMessage.warning('新密码不能与原密码相同')
        return
    }
    saving.value = true
    try {
        await api.post('/auth/change-password', {
            oldPassword: pwd.old,
            newPassword: pwd.next
        })
        ElMessage.success('密码修改成功，请重新登录')
        userStore.logout()
        setTimeout(() => { location.href = '/admin/login' }, 800)
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.page-title {
    font-family: var(--font-brush);
    font-size: 22px;
    color: var(--color-primary);
    letter-spacing: 3px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--color-primary);
}
.setting-card { border: none; box-shadow: none; margin-bottom: 20px; }
.setting-card :deep(.el-card__header) {
    background: transparent;
    color: var(--color-primary);
    border-bottom: 1px solid var(--color-border);
    padding: 12px 0;
}
.setting-card :deep(.el-card__body) { padding: 20px 0; }
</style>
