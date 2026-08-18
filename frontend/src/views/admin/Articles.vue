<template>
    <div class="admin-page">
        <div class="page-head">
            <h1 class="page-title">内容管理</h1>
            <el-button type="primary" @click="$router.push('/admin/articles/edit')">
                <el-icon><Plus /></el-icon> 新建内容
            </el-button>
        </div>

        <div class="filter-bar">
            <el-input v-model="query.keyword" placeholder="搜索标题..." clearable style="width: 260px;" @keyup.enter="reload">
                <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="query.category" placeholder="全部栏目" clearable style="width: 160px;" @change="reload">
                <el-option v-for="c in CATEGORIES" :key="c.value" :label="c.label" :value="c.value" />
            </el-select>
            <el-select v-model="query.type" placeholder="全部类型" clearable style="width: 140px;" @change="reload">
                <el-option label="文章" value="article" />
                <el-option label="视频" value="video" />
                <el-option label="图集" value="image" />
            </el-select>
            <el-button @click="reload">查询</el-button>
        </div>

        <el-table :data="list" v-loading="loading" border stripe>
            <el-table-column type="index" width="55" label="#" />
            <el-table-column prop="title" label="标题" min-width="280" show-overflow-tooltip />
            <el-table-column prop="category" label="栏目" width="110">
                <template #default="{ row }">{{ categoryLabel(row.category) }}</template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="80">
                <template #default="{ row }">{{ typeLabel(row.type) }}</template>
            </el-table-column>
            <el-table-column prop="views" label="浏览" width="80" />
            <el-table-column label="发布时间" width="170">
                <template #default="{ row }">{{ formatDate(row.date) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="90">
                <template #default="{ row }">
                    <el-tag :type="row.published ? 'success' : 'info'" size="small">
                        {{ row.published ? '已发布' : '草稿' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="170" fixed="right">
                <template #default="{ row }">
                    <el-button type="primary" link @click="$router.push(`/admin/articles/edit/${row.id}`)">编辑</el-button>
                    <el-button type="danger" link @click="onDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="pagination">
            <el-pagination
                v-model:current-page="query.page"
                v-model:page-size="query.pageSize"
                :total="total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                background
                @size-change="reload"
                @current-change="reload"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { articles } from '@/api'

const CATEGORIES = [
    { value: 'news', label: '非遗资讯' },
    { value: 'theory', label: '教育理论' },
    { value: 'projects', label: '非遗项目' },
    { value: 'cultural', label: '文创产品' },
    { value: 'patterns', label: '图案纹样' },
    { value: 'materials', label: '材料汇总' },
    { value: 'brand', label: '品牌发布' },
    { value: 'courses', label: '课程鉴赏' },
    { value: 'academic', label: '学术专题' }
]

const query = reactive({
    keyword: '',
    category: '',
    type: '',
    page: 1,
    pageSize: 20
})

const list = ref([])
const total = ref(0)
const loading = ref(false)

const categoryLabel = v => CATEGORIES.find(c => c.value === v)?.label || v
const typeLabel = t => ({ article: '文章', video: '视频', image: '图集' }[t] || '文章')
const formatDate = d => d ? new Date(d).toLocaleString('zh-CN') : ''

const reload = async () => {
    loading.value = true
    try {
        const res = await articles.list(query)
        list.value = res.items || []
        total.value = res.total || 0
    } finally {
        loading.value = false
    }
}

const onDelete = row => {
    ElMessageBox.confirm(`确定删除"${row.title}"？`, '删除确认', { type: 'warning' })
        .then(async () => {
            await articles.remove(row.id)
            ElMessage.success('已删除')
            reload()
        }).catch(() => {})
}

onMounted(reload)
</script>

<style scoped>
.page-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
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
.pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}
</style>
