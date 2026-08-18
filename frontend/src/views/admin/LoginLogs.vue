<template>
    <div class="admin-page">
        <h1 class="page-title">登录日志</h1>
        <el-table :data="list" v-loading="loading" border stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="username" label="用户名" width="140" />
            <el-table-column label="结果" width="90">
                <template #default="{ row }">
                    <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                        {{ row.success ? '成功' : '失败' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="reason" label="备注" min-width="160" show-overflow-tooltip />
            <el-table-column prop="ip" label="IP" width="150" />
            <el-table-column prop="user_agent" label="User-Agent" min-width="260" show-overflow-tooltip />
            <el-table-column label="时间" width="180">
                <template #default="{ row }">{{ formatDate(row.at) }}</template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination v-model:current-page="page" v-model:page-size="pageSize"
                           :total="total" :page-sizes="[20, 50, 100]"
                           layout="total, sizes, prev, pager, next, jumper" background
                           @size-change="reload" @current-change="reload" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)

const formatDate = d => d ? new Date(d).toLocaleString('zh-CN') : ''

const reload = async () => {
    loading.value = true
    try {
        const res = await api.get('/users/logs/login', { params: { page: page.value, pageSize: pageSize.value } })
        list.value = res.items || []
        total.value = res.total || 0
    } finally { loading.value = false }
}

onMounted(reload)
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
.pagination { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>
