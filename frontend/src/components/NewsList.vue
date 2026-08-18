<template>
    <div class="news-list">
        <router-link
            v-for="item in items"
            :key="item.id"
            :to="`/article/${item.id}`"
            class="news-item"
        >
            <div class="news-date">
                <span class="d">{{ formatDay(item.date) }}</span>
                <span class="m">{{ formatMonth(item.date) }}</span>
            </div>
            <div style="flex: 1;">
                <div class="news-item-title">
                    <span class="news-type-badge" :class="item.type">{{ typeLabel(item.type) }}</span>
                    {{ item.title }}
                </div>
            </div>
        </router-link>
        <el-empty v-if="!items.length" description="暂无内容" :image-size="80" />
    </div>
</template>

<script setup>
defineProps({
    items: { type: Array, default: () => [] }
})

const formatDay = d => new Date(d).getDate().toString().padStart(2, '0')
const formatMonth = d => {
    const dt = new Date(d)
    return `${String(dt.getMonth() + 1).padStart(2,'0')}/${dt.getFullYear()}`
}
const typeLabel = t => ({ article: '文章', video: '视频', image: '图集' }[t] || '文章')
</script>

<style scoped>
.news-list {
    background: #fff;
    border-radius: 8px;
    padding: 16px 24px;
    box-shadow: var(--shadow-sm);
}
.news-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px dashed var(--color-border);
    transition: transform .2s;
}
.news-item:last-child { border-bottom: none; }
.news-item:hover { transform: translateX(4px); }
.news-date {
    flex-shrink: 0;
    width: 54px;
    text-align: center;
    padding: 6px 4px;
    background: var(--color-bg);
    border-radius: 4px;
    border-left: 3px solid var(--color-primary);
}
.news-date .d { display: block; font-size: 20px; font-weight: 700; color: var(--color-primary); line-height: 1; }
.news-date .m { display: block; font-size: 11px; color: var(--color-text-mute); margin-top: 2px; }
.news-item-title {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.news-item:hover .news-item-title { color: var(--color-primary); }
.news-type-badge {
    display: inline-block;
    padding: 1px 6px;
    background: var(--color-primary-light);
    color: #fff;
    font-size: 10px;
    border-radius: 2px;
    margin-right: 6px;
    vertical-align: middle;
}
.news-type-badge.video { background: var(--color-accent); }
.news-type-badge.image { background: var(--color-gold); }
</style>
