<template>
    <div class="admin-page">
        <h1 class="page-title">仪表盘</h1>

        <div class="stat-cards">
            <div class="stat-card">
                <el-icon color="#74256A" :size="32"><Document /></el-icon>
                <div>
                    <div class="stat-num">{{ display(stats.totalArticles) }}</div>
                    <div class="stat-label">内容总数</div>
                </div>
            </div>
            <div class="stat-card">
                <el-icon color="#C0392B" :size="32"><View /></el-icon>
                <div>
                    <div class="stat-num">{{ display(stats.totalViews) }}</div>
                    <div class="stat-label">总浏览量</div>
                </div>
            </div>
            <div class="stat-card">
                <el-icon color="#C9A961" :size="32"><Menu /></el-icon>
                <div>
                    <div class="stat-num">{{ display(stats.totalCategories) }}</div>
                    <div class="stat-label">栏目数量</div>
                </div>
            </div>
            <div class="stat-card">
                <el-icon color="#9B4090" :size="32"><Star /></el-icon>
                <div>
                    <div class="stat-num">{{ display(stats.published) }}</div>
                    <div class="stat-label">已发布</div>
                </div>
            </div>
        </div>

        <div class="admin-block">
            <div class="block-header">
                <h3>最近发布</h3>
                <router-link to="/admin/articles" class="more">查看全部 →</router-link>
            </div>
            <el-table :data="recent" style="width: 100%" v-loading="loading">
                <el-table-column prop="title" label="标题" min-width="300" show-overflow-tooltip />
                <el-table-column prop="category" label="栏目" width="120" />
                <el-table-column prop="views" label="浏览" width="90" />
                <el-table-column label="发布时间" width="180">
                    <template #default="{ row }">{{ formatDate(row.date) }}</template>
                </el-table-column>
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag :type="row.published ? 'success' : 'info'" size="small">
                            {{ row.published ? '已发布' : '草稿' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="$router.push(`/admin/articles/edit/${row.id}`)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Document, View, Menu, Star } from '@element-plus/icons-vue'
import { articles } from '@/api'

const loading = ref(false)

// null 表示尚未加载或获取失败 → 显示 '-'
const stats = reactive({
    totalArticles: null,
    totalViews: null,
    totalCategories: null,
    published: null
})

const recent = ref([])

const display = v => (v === null || v === undefined) ? '-' : v
const formatDate = d => d ? new Date(d).toLocaleString('zh-CN') : ''

const load = async () => {
    loading.value = true
    try {
        const [s, r] = await Promise.allSettled([
            articles.stats(),
            articles.list({ pageSize: 8, sortBy: 'latest' })
        ])
        if (s.status === 'fulfilled' && s.value) {
            stats.totalArticles   = Number.isFinite(s.value.totalArticles)   ? s.value.totalArticles   : null
            stats.totalViews      = Number.isFinite(s.value.totalViews)      ? s.value.totalViews      : null
            stats.totalCategories = Number.isFinite(s.value.totalCategories) ? s.value.totalCategories : null
            stats.published       = Number.isFinite(s.value.published)       ? s.value.published       : null
        }
        if (r.status === 'fulfilled' && r.value?.items) {
            recent.value = r.value.items
        }
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<style scoped>
.page-title {
    font-family: var(--font-brush);
    font-size: 24px;
    color: var(--color-primary);
    letter-spacing: 3px;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--color-primary);
}
.stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
    margin-bottom: 30px;
    padding: 20px 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
}
.stat-card {
    padding: 6px 0;
    display: flex;
    align-items: center;
    gap: 16px;
    border-right: 1px solid var(--color-border);
}
.stat-card:last-child { border-right: none; }
.stat-num {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-primary);
    line-height: 1;
}
.stat-label {
    font-size: 13px;
    color: var(--color-text-mute);
    margin-top: 6px;
}
.admin-block {
    padding: 0;
    margin-bottom: 30px;
}
.block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--color-border);
}
.block-header h3 {
    font-size: 16px;
    color: var(--color-primary);
    font-weight: 600;
}
.more { font-size: 13px; color: var(--color-primary); }
</style>
