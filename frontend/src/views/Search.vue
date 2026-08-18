<template>
    <section class="section search-section">
        <div class="search-head">
            <h1>搜索结果</h1>
            <el-input v-model="query.keyword" placeholder="搜索关键词" size="large" clearable @keyup.enter="doSearch">
                <template #prefix><el-icon><Search /></el-icon></template>
                <template #append>
                    <el-button type="primary" @click="doSearch">搜 索</el-button>
                </template>
            </el-input>
            <div v-if="submitted" class="search-hint">
                关键词「<strong>{{ submitted }}</strong>」— 共找到 <strong>{{ total }}</strong> 条结果
            </div>
        </div>

        <div class="filter-bar" v-if="submitted">
            <el-radio-group v-model="query.category" @change="doSearch">
                <el-radio-button value="">全部栏目</el-radio-button>
                <el-radio-button v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</el-radio-button>
            </el-radio-group>
        </div>

        <el-skeleton v-if="loading" :rows="8" animated />

        <div v-else-if="list.length" class="card-grid">
            <router-link v-for="a in list" :key="a.id" :to="`/article/${a.id}`" class="info-card">
                <div class="info-card-img">
                    <img v-if="a.cover" :src="a.cover" :alt="a.title" loading="lazy">
                    <div v-else class="cover-placeholder">{{ categoryLabel(a.category) }}</div>
                </div>
                <div class="info-card-body">
                    <div class="tags-line">
                        <span class="info-tag">{{ categoryLabel(a.category) }}</span>
                        <span v-if="a.type && a.type !== 'article'" class="info-tag" :class="`tag-${a.type}`">
                            {{ a.type === 'video' ? '视频' : '图集' }}
                        </span>
                    </div>
                    <h3 v-html="highlight(a.title)"></h3>
                    <p v-html="highlight(a.excerpt || '')"></p>
                    <div class="info-meta">
                        <span>{{ formatDate(a.date) }}</span>
                        <span>浏览 {{ a.views || 0 }}</span>
                    </div>
                </div>
            </router-link>
        </div>

        <el-empty v-else-if="submitted" :description="`没有找到与「${submitted}」相关的内容`" />
        <el-empty v-else description="请输入关键词开始搜索" />

        <div v-if="total > query.pageSize" class="pagination">
            <el-pagination v-model:current-page="query.page" :page-size="query.pageSize" :total="total"
                           layout="prev, pager, next" background @current-change="loadPage" />
        </div>
    </section>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
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

const route = useRoute()
const router = useRouter()

const query = reactive({ keyword: '', category: '', page: 1, pageSize: 12 })
const submitted = ref('')
const list = ref([])
const total = ref(0)
const loading = ref(false)

const categoryLabel = v => CATEGORIES.find(c => c.value === v)?.label || v
const formatDate = d => d ? new Date(d).toLocaleDateString('zh-CN') : ''

const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const highlight = text => {
    if (!submitted.value) return escapeHtml(text)
    const esc = escapeHtml(text)
    const key = escapeHtml(submitted.value)
    return esc.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        m => `<mark>${m}</mark>`)
}

const load = async () => {
    if (!query.keyword.trim()) { list.value = []; total.value = 0; submitted.value = ''; return }
    loading.value = true
    try {
        const res = await articles.list(query)
        list.value = res.items || []
        total.value = res.total || 0
        submitted.value = query.keyword.trim()
    } finally { loading.value = false }
}

const doSearch = () => {
    query.page = 1
    router.replace({ path: '/search', query: { q: query.keyword, category: query.category || undefined } })
    load()
}

const loadPage = () => load()

// 从 URL 参数初始化
const initFromRoute = () => {
    query.keyword = route.query.q || ''
    query.category = route.query.category || ''
    query.page = 1
    if (query.keyword) load()
}

onMounted(initFromRoute)
watch(() => route.query, initFromRoute)
</script>

<style scoped>
.search-section { max-width: 1200px; padding-top: 40px; }
.search-head { margin-bottom: 30px; }
.search-head h1 {
    font-family: var(--font-brush);
    font-size: 26px;
    color: var(--color-primary);
    letter-spacing: 4px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--color-primary);
}
.search-hint {
    margin-top: 14px;
    color: var(--color-text-soft);
    font-size: 14px;
}
.search-hint strong { color: var(--color-primary); }
.filter-bar {
    padding: 10px 0 20px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 20px;
}
.tags-line { margin-bottom: 8px; display: flex; gap: 4px; flex-wrap: wrap; }
.tag-video { background: rgba(192,57,43,.15); color: var(--color-accent); }
.tag-image { background: rgba(201,169,97,.2); color: #8B7527; }
.cover-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: var(--color-primary); color: rgba(255,255,255,.9);
    font-family: var(--font-brush); font-size: 32px; letter-spacing: 4px;
}
:deep(mark) { background: rgba(201,169,97,.4); color: var(--color-primary); padding: 0 2px; }
.pagination { display: flex; justify-content: center; margin-top: 40px; }
</style>
