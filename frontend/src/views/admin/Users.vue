<template>
    <div class="admin-page">
        <div class="page-head">
            <h1 class="page-title">用户管理</h1>
            <el-button type="primary" @click="openCreate">
                <el-icon><Plus /></el-icon>&nbsp;新建用户
            </el-button>
        </div>

        <div class="filter-bar">
            <el-input v-model="query.keyword" placeholder="搜索用户名" clearable style="width: 240px;" @keyup.enter="reload">
                <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="query.role" placeholder="全部角色" clearable style="width: 140px;" @change="reload">
                <el-option label="管理员" value="admin" />
                <el-option label="普通用户" value="user" />
            </el-select>
            <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px;" @change="reload">
                <el-option label="启用" value="active" />
                <el-option label="禁用" value="disabled" />
            </el-select>
            <el-button @click="reload">查询</el-button>
        </div>

        <el-table :data="list" v-loading="loading" border stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="username" label="用户名" min-width="160" />
            <el-table-column label="角色" width="100">
                <template #default="{ row }">
                    <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
                        {{ row.role === 'admin' ? '管理员' : '普通用户' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
                <template #default="{ row }">
                    <el-tag :type="row.status === 'active' ? 'success' : 'warning'" size="small">
                        {{ row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="最近登录" width="180">
                <template #default="{ row }">{{ formatDate(row.last_login_at) || '—' }}</template>
            </el-table-column>
            <el-table-column label="创建时间" width="180">
                <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="260" fixed="right">
                <template #default="{ row }">
                    <el-button size="small" type="primary" link @click="openEdit(row)">编辑</el-button>
                    <el-button size="small" link @click="openReset(row)">重置密码</el-button>
                    <el-button size="small" :type="row.status === 'active' ? 'warning' : 'success'" link
                               :disabled="row.id === myId" @click="toggleStatus(row)">
                        {{ row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button size="small" type="danger" link :disabled="row.id === myId" @click="onDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="pagination">
            <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize"
                           :total="total" :page-sizes="[10,20,50]"
                           layout="total, sizes, prev, pager, next, jumper" background
                           @size-change="reload" @current-change="reload" />
        </div>

        <!-- 新建/编辑 弹窗 -->
        <el-dialog v-model="dialog.visible" :title="dialog.mode === 'create' ? '新建用户' : '编辑用户'" width="480px" @close="resetDialog">
            <el-form :model="form" label-width="90px">
                <el-form-item label="用户名">
                    <el-input v-model="form.username" :disabled="dialog.mode !== 'create'" placeholder="3-20 位字母/数字/下划线" />
                </el-form-item>
                <el-form-item v-if="dialog.mode === 'create'" label="密码">
                    <el-input v-model="form.password" type="password" show-password placeholder="6-60 位" />
                </el-form-item>
                <el-form-item label="角色">
                    <el-radio-group v-model="form.role">
                        <el-radio-button value="user">普通用户</el-radio-button>
                        <el-radio-button value="admin">管理员</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="form.status">
                        <el-radio-button value="active">启用</el-radio-button>
                        <el-radio-button value="disabled">禁用</el-radio-button>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialog.visible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
            </template>
        </el-dialog>

        <!-- 重置密码 弹窗 -->
        <el-dialog v-model="resetDlg.visible" title="重置密码" width="380px">
            <el-form label-width="90px">
                <el-form-item label="用户名">{{ resetDlg.username }}</el-form-item>
                <el-form-item label="新密码">
                    <el-input v-model="resetDlg.password" type="password" show-password placeholder="6-60 位" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="resetDlg.visible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="submitReset">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const myId = computed(() => userStore.info?.id)

const query = reactive({ keyword: '', role: '', status: '', page: 1, pageSize: 20 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)

const dialog = reactive({ visible: false, mode: 'create', id: null })
const form = reactive({ username: '', password: '', role: 'user', status: 'active' })

const resetDlg = reactive({ visible: false, id: null, username: '', password: '' })

const formatDate = d => d ? new Date(d).toLocaleString('zh-CN') : ''

const reload = async () => {
    loading.value = true
    try {
        const res = await api.get('/users', { params: query })
        list.value = res.items || []
        total.value = res.total || 0
    } finally { loading.value = false }
}

const resetDialog = () => {
    dialog.mode = 'create'; dialog.id = null
    Object.assign(form, { username: '', password: '', role: 'user', status: 'active' })
}

const openCreate = () => { resetDialog(); dialog.visible = true }

const openEdit = row => {
    dialog.mode = 'edit'; dialog.id = row.id
    Object.assign(form, { username: row.username, password: '', role: row.role, status: row.status })
    dialog.visible = true
}

const submitForm = async () => {
    saving.value = true
    try {
        if (dialog.mode === 'create') {
            await api.post('/users', form)
            ElMessage.success('创建成功')
        } else {
            await api.put(`/users/${dialog.id}`, { role: form.role, status: form.status })
            ElMessage.success('保存成功')
        }
        dialog.visible = false
        reload()
    } finally { saving.value = false }
}

const openReset = row => {
    resetDlg.id = row.id; resetDlg.username = row.username; resetDlg.password = ''
    resetDlg.visible = true
}
const submitReset = async () => {
    if (resetDlg.password.length < 6) return ElMessage.warning('密码至少 6 位')
    saving.value = true
    try {
        await api.put(`/users/${resetDlg.id}`, { password: resetDlg.password })
        ElMessage.success('密码已重置')
        resetDlg.visible = false
    } finally { saving.value = false }
}

const toggleStatus = row => {
    const next = row.status === 'active' ? 'disabled' : 'active'
    api.put(`/users/${row.id}`, { status: next }).then(() => {
        ElMessage.success(next === 'disabled' ? '已禁用' : '已启用')
        reload()
    })
}

const onDelete = row => {
    ElMessageBox.confirm(`确认删除用户「${row.username}」？此操作不可撤销`, '删除确认', { type: 'warning' })
        .then(async () => {
            await api.delete(`/users/${row.id}`)
            ElMessage.success('已删除')
            reload()
        }).catch(() => {})
}

onMounted(reload)
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title {
    font-family: var(--font-brush);
    font-size: 22px;
    color: var(--color-primary);
    letter-spacing: 3px;
}
.filter-bar {
    padding: 12px 0 20px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}
.pagination { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>
