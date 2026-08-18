<template>
    <section class="bottom-columns">
        <div class="bottom-inner">
            <!-- 左：焦点图 + 列表 -->
            <div class="col col-news" :style="colStyle">
                <div class="col-header">
                    <div class="h30">
                        <span class="deco-l"></span>
                        <router-link :to="columns[0].link" class="col-title">{{ columns[0].title }}</router-link>
                        <span class="deco-r"></span>
                    </div>
                    <router-link :to="columns[0].link" class="more-btn">更多</router-link>
                </div>

                <router-link
                    v-if="columns[0].showFeatured && news.featured"
                    :to="`/article/${news.featured.id}`"
                    class="featured"
                >
                    <div class="featured-cover" :style="coverStyle(news.featured.cover, news.featured.gradient)">
                        <div class="featured-overlay">
                            <div class="featured-title">{{ news.featured.title }}</div>
                        </div>
                    </div>
                </router-link>

                <ul class="line-list">
                    <li v-for="a in news.list" :key="a.id">
                        <router-link :to="`/article/${a.id}`" class="line-title">{{ a.title }}</router-link>
                        <span class="line-date">{{ formatDate(a.date) }}</span>
                    </li>
                    <li v-if="!news.list.length && !loading" class="empty">暂无内容</li>
                </ul>
            </div>

            <!-- 中：标题+摘要+日期 -->
            <div class="col col-forum" ref="centerRef">
                <div class="col-header">
                    <div class="h30">
                        <span class="deco-l"></span>
                        <router-link :to="columns[1].link" class="col-title">{{ columns[1].title }}</router-link>
                        <span class="deco-r"></span>
                    </div>
                    <router-link :to="columns[1].link" class="more-btn">更多</router-link>
                </div>

                <ul class="excerpt-list">
                    <li v-for="a in cultural" :key="a.id">
                        <router-link :to="`/article/${a.id}`" class="excerpt-title">{{ a.title }}</router-link>
                        <p class="excerpt-content">{{ a.excerpt }}</p>
                        <div class="excerpt-date">{{ formatDate(a.date) }}</div>
                    </li>
                    <li v-if="!cultural.length && !loading" class="empty">暂无内容</li>
                </ul>
            </div>

            <!-- 右：列表 + 底部大图 -->
            <div class="col col-topic" :style="colStyle">
                <div class="col-header">
                    <div class="h30">
                        <span class="deco-l"></span>
                        <router-link :to="columns[2].link" class="col-title">{{ columns[2].title }}</router-link>
                        <span class="deco-r"></span>
                    </div>
                    <router-link :to="columns[2].link" class="more-btn">更多</router-link>
                </div>

                <ul class="date-list">
                    <li v-for="a in academic.list" :key="a.id">
                        <router-link :to="`/article/${a.id}`" class="date-title">{{ a.title }}</router-link>
                        <div class="date-day">{{ formatDate(a.date) }}</div>
                    </li>
                    <li v-if="!academic.list.length && !loading" class="empty">暂无内容</li>
                </ul>

                <router-link
                    v-if="columns[2].showBanner && academic.banner"
                    :to="`/article/${academic.banner.id}`"
                    class="topic-banner"
                    :style="coverStyle(academic.banner.cover, academic.banner.gradient)"
                >
                    <div class="topic-banner-title">{{ academic.banner.title }}</div>
                </router-link>
            </div>
        </div>

        <div v-if="loading" class="loading-overlay">
            <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { articles } from '@/api'
import api from '@/api'

// 让左右栏高度 = 中栏实际高度（以中栏为基准）
const centerRef = ref(null)
const centerH = ref(0)
const colStyle = computed(() => centerH.value ? { height: centerH.value + 'px' } : null)

let ro
const measure = () => {
    if (centerRef.value) centerH.value = centerRef.value.offsetHeight
}
onMounted(async () => {
    await nextTick()
    measure()
    if (window.ResizeObserver && centerRef.value) {
        ro = new ResizeObserver(measure)
        ro.observe(centerRef.value)
    }
    window.addEventListener('resize', measure)
})
onUnmounted(() => {
    ro?.disconnect()
    window.removeEventListener('resize', measure)
})

const loading = ref(true)

// 三栏配置（可 CMS 修改）
const DEFAULT_COLUMNS = [
    { key: 'left',   title: '非遗资讯', category: 'news',     link: '/news',     count: 6, showFeatured: true,  showBanner: false, mode: 'auto', itemIds: [] },
    { key: 'center', title: '文创产品', category: 'cultural', link: '/cultural', count: 3, showFeatured: false, showBanner: false, mode: 'auto', itemIds: [] },
    { key: 'right',  title: '学术专题', category: 'academic', link: '/academic', count: 4, showFeatured: false, showBanner: true,  mode: 'auto', itemIds: [] }
]
const columns = ref(DEFAULT_COLUMNS)

const news = ref({ featured: null, list: [] })
const cultural = ref([])
const academic = ref({ list: [], banner: null })

const MOCK = {
    news: {
        featured: {
            id: 'demo-n1',
            title: '"春节——中国人庆祝传统新年的社会实践"列入人类非遗代表作',
            gradient: '#C0392B',
            cover: ''
        },
        list: [
            { id: 'demo-n2', title: '习近平：民族的特色，很古朴也很时尚', date: '2026-07-18' },
            { id: 'demo-n3', title: '守护文脉 致敬匠心——2026中国非遗年度新闻人物', date: '2026-07-15' },
            { id: 'demo-n4', title: '浙江非遗馆："风雅端午 岁时共享"主题活动', date: '2026-06-26' },
            { id: 'demo-n5', title: '杭州非遗嘉年华亮相北京', date: '2026-06-26' },
            { id: 'demo-n6', title: '北京非遗：擘画"保护传承利用典范之城"新篇章', date: '2026-06-17' }
        ]
    },
    cultural: [
        {
            id: 'demo-c1',
            title: '构建非遗传承体验新场景——从"建设施"到"广泛惠民"',
            excerpt: '"十五五"规划纲要明确提出"提升非物质文化遗产保护传承水平，培育传承体验新场景"，首次将非遗传承体验新场景纳入国家级规划……',
            date: '2026-06-02'
        },
        {
            id: 'demo-c2',
            title: '杨红 闫涵：我国非物质文化遗产领域标准化工作现状与建议',
            excerpt: '标准化工作是非物质文化遗产保护措施规范有序开展的软性工具，也是体现非遗保护科学性、系统性的保障手段。我国非物质文化遗产标准化工作起步于……',
            date: '2025-08-05'
        },
        {
            id: 'demo-c3',
            title: '凝聚共识 规范行动——文化行业标准《非物质文化遗产数字化保护……》',
            excerpt: '《非物质文化遗产数字化保护数字资源采集和著录》是我国非物质文化遗产领域的首个系列行业标准，它的批准发布，对非遗数字化工作……',
            date: '2025-08-01'
        }
    ],
    academic: {
        list: [
            { id: 'demo-a1', title: '解锁非遗保护传承新场景', date: '2026-06-18' },
            { id: 'demo-a2', title: '非遗保护国际合作，不止于"办一次培训"', date: '2026-04-22' },
            { id: 'demo-a3', title: '宁夏剪纸：从"炕头艺术"走向广阔舞台', date: '2026-04-16' }
        ],
        banner: {
            id: 'demo-a4',
            title: '今天，我们该如何保护二十四节气',
            gradient: '#74256A',
            cover: ''
        }
    }
}

const coverStyle = (cover, gradient) => cover
    ? { backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: gradient || '#74256A' }

const formatDate = d => {
    if (!d) return ''
    const dt = new Date(d)
    if (isNaN(dt)) return d
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}.${m}.${day}`
}

const loadColumnsConfig = async () => {
    try {
        const res = await api.get('/settings/news-columns')
        if (res?.columns?.length === 3) columns.value = res.columns
    } catch { /* fallback to default */ }
}

// 按栏目配置拉取内容：mode=manual 用 ids 精确取；mode=auto 用 category 取最新
const fetchColumn = col => {
    if (col.mode === 'manual' && col.itemIds?.length) {
        return articles.list({ ids: col.itemIds.join(',') })
    }
    return articles.list({ category: col.category, pageSize: col.count })
}

const loadData = async () => {
    loading.value = true
    try {
        const [colLeft, colCenter, colRight] = columns.value
        const [n, c, a] = await Promise.allSettled([
            fetchColumn(colLeft),
            fetchColumn(colCenter),
            fetchColumn(colRight)
        ])
        const pickItems = (result, fallback) => {
            if (result.status !== 'fulfilled' || !result.value?.items?.length) return fallback
            return result.value.items
        }

        const newsItems = pickItems(n, [MOCK.news.featured, ...MOCK.news.list])
        news.value = colLeft.showFeatured
            ? { featured: newsItems[0], list: newsItems.slice(1, colLeft.count) }
            : { featured: null, list: newsItems.slice(0, colLeft.count) }

        cultural.value = pickItems(c, MOCK.cultural).slice(0, colCenter.count)

        const academicItems = pickItems(a, [...MOCK.academic.list, MOCK.academic.banner])
        academic.value = colRight.showBanner
            ? { list: academicItems.slice(0, colRight.count - 1), banner: academicItems[colRight.count - 1] || academicItems[0] }
            : { list: academicItems.slice(0, colRight.count), banner: null }
    } catch (e) {
        console.error('[HomeBottomColumns] load failed, using mock', e)
        news.value = MOCK.news
        cultural.value = MOCK.cultural
        academic.value = MOCK.academic
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await loadColumnsConfig()
    await loadData()
})
</script>

<style scoped>
.bottom-columns {
    background: var(--color-bg);
    padding: 60px 24px 80px;
    position: relative;
}
.bottom-inner {
    position: relative;
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 32px;
    align-items: start;                   /* 中栏按自然高，左右栏由 JS 同步压缩 */
}
.col {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;                     /* 超出中栏高度的内容裁掉 */
}
.col-forum { overflow: visible; }         /* 中栏不裁 */

/* 左栏焦点图 / 右栏底部大图 允许被压缩以适应总高 */
.featured,
.topic-banner {
    flex: 0 1 auto;
    min-height: 0;
}
/* 列表撑满剩余空间 */
.line-list,
.date-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}
/* 参考 ihchina.cn #page4 的 h30 标题：两侧带花体钩形装饰 */
.col-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 14px;
    margin-bottom: 20px;
    border-bottom: 1px solid #E5E5E5;
}
.h30 {
    display: flex;
    align-items: center;
    gap: 14px;
    line-height: 32px;
}
/* 参考 ihchina .t_head .h30 :before/:after：png7.png 44x32，左右各 22×32 */
.deco-l,
.deco-r {
    display: inline-block;
    width: 22px;
    height: 32px;
    flex-shrink: 0;
    background-image: url('/h30-deco.png');
    background-repeat: no-repeat;
    background-size: 44px 32px;
}
.deco-l { background-position: left center; }
.deco-r { background-position: right center; }

.col-title {
    font-family: "SimSun", "宋体", "STSong", serif;
    font-size: 26px;
    color: #333;
    letter-spacing: 4px;
    font-weight: 700;
    padding: 0 4px;
    line-height: 1;
}
.col-title:hover { color: var(--color-primary); }

/* 参考 ihchina .t_more：两侧带 horn 三角装饰（缩小整体尺寸） */
.more-btn {
    position: relative;
    display: inline-block;
    padding: 0 14px;
    line-height: 18px;
    font-size: 10px;
    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
    color: #888;
    letter-spacing: 1px;
    transition: color .2s;
    vertical-align: middle;
}
.more-btn::before,
.more-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    margin-top: -6px;
    width: 12px;
    height: 12px;
    background-image: url('/t_more-deco.png');
    background-repeat: no-repeat;
    background-size: 24px 24px;
}
.more-btn::before {
    left: 0;
    background-position: 0 0;
}
.more-btn::after {
    right: 0;
    background-position: -12px 0;
}
.more-btn:hover { color: var(--color-primary); }
.more-btn:hover::before { background-position: 0 -12px; }
.more-btn:hover::after  { background-position: -12px -12px; }
.empty {
    padding: 40px 0;
    text-align: center;
    color: var(--color-text-mute);
    font-size: 13px;
}

/* ============ 参考 ihchina .home4 ============ */

/* 左栏 · 焦点图（对应 ihchina .home4 .img） */
.featured { display: block; margin-bottom: 22px; }
.featured-cover {
    aspect-ratio: 440/248;
    overflow: hidden;
    position: relative;
    transition: transform .4s;
}
.featured:hover .featured-cover { transform: translateY(-3px); }
.featured-overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 16px 18px;
    background: rgba(0,0,0,.55);
}
.featured-title {
    color: #fff;
    font-size: 14px;
    line-height: 1.5;
    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

/* 左栏 · 新闻列表 ul1：标题左 + 日期右 单行省略；紧凑高度 */
.line-list {
    padding: 6px 0 0;
    border-bottom: 1px dashed #b5b5b5;
    display: flex;
    flex-direction: column;
}
.line-list li {
    overflow: hidden;
    padding: 3px 0;
    flex: 0 0 auto;
}
.line-list li + li { margin-top: 0; }
.line-date {
    float: right;
    margin-left: 20px;
    font-family: Arial, sans-serif;
    color: #666;
    font-size: 12px;
    line-height: 20px;
    flex-shrink: 0;
}
.line-title {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13.5px;
    color: #333;
    line-height: 20px;
    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
    transition: color .2s;
}
.line-list li:hover .line-title,
.line-title:hover { color: var(--color-primary); }

/* 中栏 · 论坛 ul2：标题 + 2行摘要 + 日期 + dashed 分隔线 */
.excerpt-list li {
    padding-bottom: 22px;
    border-bottom: 1px dashed #b5b5b5;
}
.excerpt-list li + li { margin-top: 24px; }
.excerpt-title {
    display: block;
    font-size: 15px;
    color: #333;
    line-height: 22px;
    margin-bottom: 10px;
    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: color .2s;
}
.excerpt-title:hover { color: var(--color-primary); }
.excerpt-content {
    font-size: 13px;
    color: #888;
    line-height: 21px;
    margin-bottom: 12px;
    height: 42px;                /* = 2 × 21px */
    overflow: hidden;
    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
.excerpt-date {
    font-size: 13px;
    color: #999;
    font-family: Arial, sans-serif;
}

/* 右栏 · 专题 ul3：标题 + 日期 竖排 + 底部大图 */
.date-list { margin-bottom: 22px; }
.date-list li + li { margin-top: 14px; }
.date-title {
    display: block;
    font-size: 14px;
    color: #333;
    line-height: 22px;
    margin-bottom: 6px;
    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: color .2s;
}
.date-title:hover { color: var(--color-primary); }
.date-day {
    font-size: 13px;
    color: #999;
    font-family: Arial, sans-serif;
}
.topic-banner {
    display: block;
    aspect-ratio: 440/248;
    overflow: hidden;
    position: relative;
    transition: transform .4s;
}
.topic-banner:hover { transform: translateY(-3px); }
.topic-banner-title {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 16px 18px;
    background: rgba(0,0,0,.55);
    color: #fff;
    font-size: 14px;
    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
    line-height: 1.5;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.loading-overlay {
    position: absolute;
    top: 60px; left: 50%;
    transform: translateX(-50%);
    color: var(--color-primary);
}

@media (max-width: 1024px) {
    .bottom-inner { grid-template-columns: 1fr; gap: 40px; }
    .col { min-height: auto; }
}
</style>
