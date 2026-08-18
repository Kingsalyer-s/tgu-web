<template>
    <div class="login-page">
        <div class="login-card">
            <div class="login-brand">
                <img src="/logo.jpg" alt="Logo">
                <div>
                    <div class="brand-title">非遗工艺数字化辅助设计与教学平台</div>
                    <div class="brand-sub">{{ mode === 'login' ? '账号登录' : '注册新账号' }}</div>
                </div>
            </div>

            <el-tabs v-model="mode" class="mode-tabs">
                <el-tab-pane label="登录" name="login" />
                <el-tab-pane label="注册" name="register" />
            </el-tabs>

            <el-form :model="form" :rules="rules" ref="formRef" size="large" @keyup.enter="submit">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="用户名（3-20 位字母/数字/下划线）">
                        <template #prefix><el-icon><User /></el-icon></template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="form.password" type="password" :placeholder="mode === 'register' ? '密码（6-60 位）' : '密码'" show-password>
                        <template #prefix><el-icon><Lock /></el-icon></template>
                    </el-input>
                </el-form-item>
                <el-form-item v-if="mode === 'register'" prop="confirm">
                    <el-input v-model="form.confirm" type="password" placeholder="再次输入密码" show-password>
                        <template #prefix><el-icon><Lock /></el-icon></template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="large" @click="submit" :loading="loading" style="width: 100%;">
                        {{ mode === 'login' ? '登 录' : '注 册' }}
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="tips">
                <template v-if="mode === 'login'">
                    管理员默认账号：<code>admin</code> / <code>admin123</code>（首次启动后请立即修改）<br>
                    普通用户请先<a href="#" @click.prevent="mode='register'">注册账号</a>
                </template>
                <template v-else>
                    注册即成为普通用户，登录后可访问个人中心、保存作品等
                </template>
                <br>
                <router-link to="/">← 返回前台首页</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { auth } from '@/api'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const mode = ref('login')

const form = reactive({
    username: 'admin',
    password: 'admin123',
    confirm: ''
})

const rules = computed(() => ({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '3-20 位字母/数字/下划线', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        ...(mode.value === 'register' ? [{ min: 6, max: 60, message: '密码 6-60 位', trigger: 'blur' }] : [])
    ],
    confirm: [
        { validator: (r, v, cb) => v === form.password ? cb() : cb(new Error('两次密码不一致')), trigger: 'blur' }
    ]
}))

const submit = async () => {
    if (!formRef.value) return
    try {
        await formRef.value.validate()
        loading.value = true
        const res = mode.value === 'login'
            ? await auth.login({ username: form.username, password: form.password })
            : await auth.register({ username: form.username, password: form.password })
        userStore.setAuth(res.token, res.user)
        ElMessage.success(mode.value === 'login' ? '登录成功' : '注册成功，已自动登录')
        const redirect = route.query.redirect
            || (res.user.role === 'admin' ? '/admin/dashboard' : '/')
        router.push(redirect)
    } catch (e) {
        // 拦截器已提示
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    padding: 24px;
    position: relative;
}
.login-page::before {
    content: '';
    position: absolute; inset: 0;
    background: rgba(0,0,0,.15);
}
.login-card {
    position: relative;
    width: 100%;
    max-width: 420px;
    background: #fff;
    padding: 40px 36px;
    border-top: 3px solid var(--color-gold);
}
.login-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--color-primary);
}
.login-brand img { width: 48px; height: 48px; border-radius: 6px; }
.brand-title {
    font-family: var(--font-brush);
    font-size: 16px;
    color: var(--color-primary);
    letter-spacing: 2px;
    font-weight: 700;
    line-height: 1.3;
}
.brand-sub {
    font-size: 12px;
    color: var(--color-text-mute);
    letter-spacing: 2px;
    margin-top: 4px;
}
.mode-tabs { margin-bottom: 12px; }
.mode-tabs :deep(.el-tabs__nav-wrap::after) { height: 1px; background: #eee; }
.mode-tabs :deep(.el-tabs__active-bar) { background: var(--color-primary); height: 2px; }
.mode-tabs :deep(.el-tabs__item.is-active) { color: var(--color-primary); font-weight: 600; }
.tips {
    margin-top: 12px;
    padding-top: 16px;
    border-top: 1px dashed var(--color-border);
    font-size: 12px;
    color: var(--color-text-mute);
    text-align: center;
    line-height: 2;
}
.tips code {
    background: var(--color-bg);
    padding: 1px 6px;
    border-radius: 3px;
    color: var(--color-primary);
    font-family: 'Courier New', monospace;
}
.tips a { color: var(--color-primary); font-weight: 500; }
</style>
