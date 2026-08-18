<template>
    <section class="section detail-section">
        <el-skeleton v-if="loading" :rows="10" animated />

        <template v-else-if="article">
            <div class="detail-meta">
                <router-link :to="backLink" class="back-link">← 返回列表</router-link>
                <div class="meta-tags">
                    <span v-for="t in article.tags || []" :key="t" class="info-tag">{{ t }}</span>
                    <span class="meta-item">发布：{{ formatDate(article.date) }}</span>
                    <span class="meta-item">浏览：{{ article.views || 0 }}</span>
                </div>
            </div>

            <article class="detail-body">
                <h1 class="detail-title">{{ article.title }}</h1>
                <img v-if="article.cover" :src="article.cover" :alt="article.title" class="detail-cover" loading="lazy">
                <div v-if="article.excerpt" class="detail-excerpt">{{ article.excerpt }}</div>
                <div class="detail-content" v-html="renderedContent"></div>
            </article>

            <!-- 上一篇 / 下一篇 -->
            <nav class="neighbors">
                <router-link v-if="neighbors.prev" :to="`/article/${neighbors.prev.id}`" class="neighbor prev">
                    <span class="arrow">← 上一篇</span>
                    <span class="title">{{ neighbors.prev.title }}</span>
                </router-link>
                <span v-else class="neighbor disabled">
                    <span class="arrow">← 上一篇</span>
                    <span class="title">已经是第一篇</span>
                </span>
                <router-link v-if="neighbors.next" :to="`/article/${neighbors.next.id}`" class="neighbor next">
                    <span class="arrow">下一篇 →</span>
                    <span class="title">{{ neighbors.next.title }}</span>
                </router-link>
                <span v-else class="neighbor disabled next">
                    <span class="arrow">下一篇 →</span>
                    <span class="title">已经是最后一篇</span>
                </span>
            </nav>

            <!-- 相关推荐 -->
            <section v-if="related.length" class="related">
                <h3 class="related-title">相关推荐</h3>
                <div class="related-grid">
                    <router-link v-for="r in related" :key="r.id" :to="`/article/${r.id}`" class="related-item">
                        <div class="related-cover">
                            <img v-if="r.cover" :src="r.cover" :alt="r.title" loading="lazy">
                            <div v-else class="related-placeholder">非遗</div>
                        </div>
                        <div class="related-info">
                            <div class="related-name">{{ r.title }}</div>
                            <div class="related-date">{{ formatDate(r.date) }}</div>
                        </div>
                    </router-link>
                </div>
            </section>
        </template>

        <el-empty v-else description="内容不存在或已下架" />
    </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import DOMPurify from 'dompurify'
import { articles } from '@/api'
import api from '@/api'

const route = useRoute()
const article = ref(null)
const loading = ref(true)
const neighbors = ref({ prev: null, next: null })
const related = ref([])

const formatDate = d => {
    if (!d) return ''
    const dt = new Date(d)
    return isNaN(dt) ? d : dt.toLocaleDateString('zh-CN')
}

const backLink = computed(() => {
    const cat = article.value?.category
    const map = {
        news: '/news', theory: '/theory', projects: '/projects',
        cultural: '/cultural', patterns: '/patterns', materials: '/materials',
        brand: '/brand', courses: '/courses', academic: '/academic'
    }
    return map[cat] || '/'
})

const renderedContent = computed(() => {
    const raw = article.value?.content
    if (!raw) return `<p>${article.value?.excerpt || '暂无正文'}</p>`
    // 已是 HTML（富文本）直接消毒；否则按换行分段
    const isHtml = /<[a-z][\s\S]*>/i.test(raw)
    const html = isHtml
        ? raw
        : raw.split(/\n\n+/).map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')
    return DOMPurify.sanitize(html, {
        ADD_TAGS: ['iframe', 'video', 'source', 'audio'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'controls', 'autoplay', 'loop', 'poster', 'preload']
    })
})

const escapeHtml = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const load = async () => {
    loading.value = true
    neighbors.value = { prev: null, next: null }
    related.value = []
    try {
        const res = await articles.get(route.params.id)
        article.value = res.item || res
        // 平行加载上下篇与推荐（失败不影响主体）
        const [n, r] = await Promise.allSettled([
            api.get(`/articles/${route.params.id}/neighbors`),
            api.get(`/articles/${route.params.id}/related`)
        ])
        if (n.status === 'fulfilled') neighbors.value = { prev: n.value.prev, next: n.value.next }
        if (r.status === 'fulfilled') related.value = r.value.items || []
    } catch {
        article.value = {
            id: route.params.id,
            title: '示例文章 · 后端未连接时的占位',
            date: '2026-07-26',
            views: 0,
            tags: ['示例'],
            category: 'news',
            excerpt: '这是一个演示占位内容。当 CMS 后端启动后，此处会展示真实的内容数据。',
            content: `本平台完整支持文章、图集、视频三类内容管理。\n\n您可以通过 /admin 后台登录管理员账号，创建、编辑、发布内容到各个栏目。\n\n所有内容支持富文本编辑、图片上传、分类归档、标签检索。`
        }
    } finally {
        loading.value = false
    }
}

onMounted(load)
watch(() => route.params.id, load)
</script>

<style scoped>
.detail-section { max-width: 900px; }
.detail-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0 18px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 12px;
}
.back-link {
    color: var(--color-primary);
    font-size: 14px;
    font-weight: 500;
}
.meta-tags {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
}
.meta-item {
    font-size: 12px;
    color: var(--color-text-mute);
    padding-left: 10px;
    border-left: 1px solid var(--color-border);
}
.detail-body {
    padding: 0;
}
.detail-title {
    font-size: 26px;
    color: var(--color-primary);
    margin-bottom: 20px;
    line-height: 1.4;
    font-weight: 700;
}
.detail-cover {
    width: 100%;
    border-radius: 6px;
    margin-bottom: 30px;
}
.detail-excerpt {
    padding: 14px 18px;
    border-left: 3px solid var(--color-primary);
    color: var(--color-text-soft);
    font-size: 15px;
    line-height: 1.9;
    margin-bottom: 30px;
    background: rgba(116,37,106,.04);
}
.detail-content { font-size: 16px; line-height: 2.1; color: var(--color-text); }
.detail-content :deep(p) { margin-bottom: 18px; }
.detail-content :deep(h1),
.detail-content :deep(h2),
.detail-content :deep(h3) { margin: 24px 0 14px; color: var(--color-primary); }
.detail-content :deep(img) { max-width: 100%; height: auto; margin: 12px 0; border: 1px solid var(--color-border); }
.detail-content :deep(video) { max-width: 100%; margin: 12px 0; }
.detail-content :deep(blockquote) {
    border-left: 3px solid var(--color-primary);
    padding: 8px 16px;
    color: var(--color-text-soft);
    background: rgba(116,37,106,.04);
    margin: 16px 0;
}
.detail-content :deep(pre) {
    background: #f4f0e8;
    padding: 12px 16px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    margin: 12px 0;
}
.detail-content :deep(table) { border-collapse: collapse; margin: 12px 0; width: 100%; }
.detail-content :deep(table td),
.detail-content :deep(table th) {
    border: 1px solid var(--color-border);
    padding: 8px 12px;
}
.detail-content :deep(table th) { background: var(--color-bg); color: var(--color-primary); }
.detail-content :deep(ul),
.detail-content :deep(ol) { padding-left: 28px; margin: 12px 0; }

/* 上下篇 */
.neighbors {
    margin-top: 50px;
    padding: 20px 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}
.neighbor {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 12px;
    color: var(--color-text-soft);
    transition: color .2s;
}
.neighbor:not(.disabled):hover { color: var(--color-primary); }
.neighbor.disabled { color: var(--color-text-mute); cursor: default; }
.neighbor.next { text-align: right; align-items: flex-end; }
.neighbor .arrow { font-size: 12px; color: var(--color-primary); }
.neighbor.disabled .arrow { color: var(--color-text-mute); }
.neighbor .title {
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 相关推荐 */
.related { margin-top: 40px; }
.related-title {
    font-family: var(--font-brush);
    font-size: 20px;
    color: var(--color-primary);
    letter-spacing: 3px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--color-primary);
    display: inline-block;
}
.related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
}
.related-item {
    border: 1px solid var(--color-border);
    overflow: hidden;
    transition: transform .3s, box-shadow .3s;
}
.related-item:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.related-cover {
    aspect-ratio: 16/10;
    overflow: hidden;
    background: var(--color-primary);
}
.related-cover img { width: 100%; height: 100%; object-fit: cover; }
.related-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,.85);
    font-family: var(--font-brush);
    font-size: 22px;
    letter-spacing: 4px;
}
.related-info { padding: 10px 12px; }
.related-name {
    font-size: 13.5px;
    color: var(--color-text);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 40px;
}
.related-date {
    margin-top: 6px;
    font-size: 12px;
    color: var(--color-text-mute);
}

@media (max-width: 640px) {
    .neighbors { grid-template-columns: 1fr; gap: 12px; }
    .neighbor.next { text-align: left; align-items: flex-start; }
}
</style>
