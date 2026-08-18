<template>
    <section class="section">
        <div class="filter-bar">
            <el-input
                v-model="keyword"
                :placeholder="`搜索${title}...`"
                clearable
                style="max-width: 320px;"
                @keyup.enter="reload"
            >
                <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="sortBy" style="width: 160px;" @change="reload">
                <el-option label="最新发布" value="latest" />
                <el-option label="最多浏览" value="views" />
            </el-select>
        </div>

        <el-skeleton v-if="loading" :rows="6" animated />

        <div v-else-if="list.length" class="card-grid">
            <router-link
                v-for="a in list"
                :key="a.id"
                :to="`/article/${a.id}`"
                class="info-card"
            >
                <div class="info-card-img">
                    <img v-if="a.cover" :src="a.cover" :alt="a.title" loading="lazy">
                    <div v-else class="cover-placeholder">
                        <span>{{ title.slice(0, 2) }}</span>
                    </div>
                </div>
                <div class="info-card-body">
                    <div class="tags-line">
                        <span v-for="t in (a.tags || []).slice(0,2)" :key="t" class="info-tag">{{ t }}</span>
                        <span v-if="a.type && a.type !== 'article'" class="info-tag" :class="`tag-${a.type}`">
                            {{ a.type === 'video' ? '视频' : '图集' }}
                        </span>
                    </div>
                    <h3>{{ a.title }}</h3>
                    <p>{{ a.excerpt || '暂无摘要' }}</p>
                    <div class="info-meta">
                        <span>{{ formatDate(a.date) }}</span>
                        <span>浏览 {{ a.views || 0 }}</span>
                    </div>
                </div>
            </router-link>
        </div>

        <el-empty v-else description="暂无内容，请稍后再来" />

        <div v-if="total > pageSize" class="pagination">
            <el-pagination
                v-model:current-page="page"
                :page-size="pageSize"
                :total="total"
                layout="prev, pager, next, jumper"
                background
                @current-change="reload"
            />
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { articles } from '@/api'

const props = defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    category: { type: String, required: true },  // 后端 category 键
    mockData: { type: Array, default: () => [] }  // 无后端时的示例
})

const route = useRoute()
const keyword = ref(route.query.q || '')
const sortBy = ref('latest')
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const list = ref([])
const loading = ref(false)

const formatDate = d => {
    if (!d) return ''
    const dt = new Date(d)
    return isNaN(dt) ? d : `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

const reload = async () => {
    loading.value = true
    try {
        const res = await articles.list({
            category: props.category,
            keyword: keyword.value,
            sortBy: sortBy.value,
            page: page.value,
            pageSize: pageSize.value
        })
        list.value = res.items || []
        total.value = res.total || 0
    } catch (e) {
        // fallback to mock
        list.value = props.mockData
        total.value = props.mockData.length
    } finally {
        loading.value = false
    }
}

onMounted(reload)
watch(() => route.query.q, q => { keyword.value = q || ''; reload() })
</script>

<style scoped>
.filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px 0 20px;
    border-bottom: 1px solid var(--color-border);
    align-items: center;
}
.cover-placeholder {
    width: 100%; height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: rgba(255,255,255,.9);
    font-family: var(--font-brush);
    font-size: 48px;
    letter-spacing: 6px;
}
.tags-line {
    margin-bottom: 8px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}
.tag-video { background: rgba(192,57,43,.15); color: var(--color-accent); }
.tag-image { background: rgba(201,169,97,.2); color: #8B7527; }
.pagination {
    display: flex;
    justify-content: center;
    margin-top: 40px;
}
</style>
