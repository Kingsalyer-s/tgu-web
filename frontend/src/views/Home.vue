<template>
    <!-- 1. 展览 List（纯色 · hover 展开 · 竖排字） -->
    <section class="resources1">
        <div class="x-wrap">
            <div class="list">
                <router-link
                    v-for="(item, i) in exhibits"
                    :key="i"
                    :to="item.link"
                    class="item"
                    :class="{ act: hoverIndex === i, 'no-media': !item.image && !artOf(item) }"
                    :style="stackStyle(item, i)"
                    @mouseenter="hoverIndex = i"
                >
                    <img v-if="item.image" :src="item.image" class="art-img" :class="{ loaded: imgLoaded[i] }" :alt="item.title" loading="eager" @load="onImgLoad(i)">
                    <div v-else-if="artOf(item)" class="art-svg" :style="{ background: item.color }" v-html="artOf(item)"></div>
                    <div v-if="!item.hideTitle" class="h18">{{ item.title }}</div>
                </router-link>
            </div>
        </div>
    </section>

    <!-- 2. 查询筛选（ihchina.cn/project.html 风格：横排下拉+输入+搜索按钮） -->
    <section v-if="showFilterSection" class="screen-mod">
        <div class="screen-wrap">
            <el-select
                v-for="g in visibleSelects"
                :key="g.key"
                v-model="selectValues[g.key]"
                :placeholder="g.label"
                class="sel"
                placement="bottom-start"
                :teleported="false"
                @change="onSearch"
            >
                <el-option
                    v-for="o in g.options.filter(x => !x.hidden)"
                    :key="o.value"
                    :label="o.label"
                    :value="o.value"
                />
            </el-select>

            <el-input
                v-if="filtersCfg.keyword.visible"
                v-model="q.keyword"
                :placeholder="filtersCfg.keyword.placeholder || `关键词：${filtersCfg.keyword.label}`"
                class="sel input"
                clearable
                @keyup.enter="onSearch"
            />

            <el-button type="primary" class="submit-btn" @click="onSearch">
                <el-icon><Search /></el-icon>&nbsp;搜 索
            </el-button>
        </div>
    </section>

    <!-- 3. 底部三栏 -->
    <HomeBottomColumns />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import HomeBottomColumns from '@/components/HomeBottomColumns.vue'
import api from '@/api'

const router = useRouter()

// ---------- SVG 前景工艺图（artKey → svg） ----------
const ART = {
    mask: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><path d="M100 30 Q140 30 155 70 Q170 120 160 170 Q140 220 100 240 Q60 220 40 170 Q30 120 45 70 Q60 30 100 30 Z" fill="#8B4513" stroke="#F4C87A" stroke-width="2"/><ellipse cx="80" cy="130" rx="10" ry="6" fill="#2C1810"/><ellipse cx="120" cy="130" rx="10" ry="6" fill="#2C1810"/><path d="M80 170 Q100 180 120 170" stroke="#C0392B" stroke-width="3" fill="none"/></svg>`,
    vase: `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="380" rx="60" ry="10" fill="rgba(0,0,0,.4)"/><path d="M100 40 L120 60 Q140 90 130 130 Q160 150 165 200 Q170 260 140 290 Q145 320 130 350 Q125 370 100 370 Q75 370 70 350 Q55 320 60 290 Q30 260 35 200 Q40 150 70 130 Q60 90 80 60 Z" fill="#8B1E10" stroke="#F4C87A" stroke-width="2"/><ellipse cx="100" cy="50" rx="20" ry="5" fill="#C9A961"/><path d="M65 200 Q100 190 135 200 Q100 210 65 200 Z" fill="#F4C87A"/><circle cx="100" cy="240" r="5" fill="#C9A961"/></svg>`,
    qiansi: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="s" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#C9A961"/><circle cx="2" cy="2" r=".4" fill="#E5C88C"/></pattern></defs><path d="M100 40 C130 40 155 65 150 100 C180 105 195 140 175 165 C185 195 165 220 135 210 C135 250 100 250 100 220 C100 250 65 250 65 210 C35 220 15 195 25 165 C5 140 20 105 50 100 C45 65 70 40 100 40 Z" fill="url(#s)" stroke="#F4E4A8" stroke-width="2"/><circle cx="100" cy="130" r="25" fill="#C0392B" stroke="#F4E4A8" stroke-width="2"/><circle cx="100" cy="130" r="12" fill="#8B1E10"/></svg>`,
    lantern: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><line x1="100" y1="20" x2="100" y2="50" stroke="#F4C87A" stroke-width="2"/><ellipse cx="100" cy="150" rx="80" ry="70" fill="#C0392B" stroke="#F4C87A" stroke-width="3"/><ellipse cx="100" cy="150" rx="30" ry="70" fill="none" stroke="rgba(0,0,0,.2)"/><rect x="70" y="82" width="60" height="8" fill="#8B5A2B"/><rect x="70" y="210" width="60" height="8" fill="#8B5A2B"/><path d="M85 240 Q100 260 115 240 L100 260 Z" fill="#F4C87A"/></svg>`,
    embroidery: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="30" width="160" height="240" rx="6" fill="rgba(0,0,0,.35)" stroke="#C9A961" stroke-width="2"/><circle cx="100" cy="120" r="45" fill="#E85A85"/><path d="M100 75 Q130 100 100 120 Q70 100 100 75 Z" fill="#F4C87A"/><path d="M100 120 Q130 145 100 165 Q70 145 100 120 Z" fill="#F4C87A"/><path d="M55 120 Q80 90 100 120 Q80 150 55 120 Z" fill="#F4C87A"/><path d="M145 120 Q120 90 100 120 Q120 150 145 120 Z" fill="#F4C87A"/><circle cx="100" cy="120" r="10" fill="#C0392B"/><path d="M40 210 Q100 230 160 210" stroke="#F4C87A" stroke-width="2" fill="none"/></svg>`
}
const artOf = item => ART[item.artKey] || ''

// ---------- 展览项 ----------
const DEFAULT_EXHIBITS = [
    { title: '太极拳',                  link: '/projects',   color: '#2C1810', artKey: 'mask',        image: '', hideTitle: false },
    { title: '宣纸传统制作技艺',        link: '/projects',   color: '#4A2E1B', artKey: 'vase',        image: '', hideTitle: false },
    { title: '掐丝彩砂制作技艺',        link: '/simulation', color: '#74256A', artKey: 'qiansi',      image: '', hideTitle: false },
    { title: '2026 文化和自然遗产日',   link: '/news',       color: '#C9A961', artKey: 'lantern',     image: '', hideTitle: false },
    { title: '2026 非遗过大年春节专题', link: '/courses',    color: '#8B1E10', artKey: 'embroidery',  image: '', hideTitle: false }
]
const exhibits = ref(DEFAULT_EXHIBITS)
const hoverIndex = ref(2)
const defaultIndex = computed(() => Math.min(2, exhibits.value.length - 1))

// 图片加载完成标记，用于淡入，避免加载中露出空白
const imgLoaded = reactive({})
const onImgLoad = i => { imgLoaded[i] = true }

// 每张展览图比例 488×672，list 宽:高 = (488 × N) : 672
const listAspect = computed(() => `${488 * exhibits.value.length} / 672`)

// 图片加载前用主题色兜底，避免露出空白/底层
const stackStyle = item => ({ background: item.color || '#1a0e08' })

// ---------- 筛选配置 ----------
const DEFAULT_FILTERS = {
    selects: [
        { key: 'location',    visible: true, label: '地点',     options: [{ value: 'all', label: '全部', hidden: false }] },
        { key: 'publishDate', visible: true, label: '公布时间', options: [{ value: 'all', label: '全部', hidden: false }] },
        { key: 'category',    visible: true, label: '类别',     options: [{ value: 'all', label: '全部', hidden: false }] },
        { key: 'subtype',     visible: true, label: '类型',     options: [{ value: 'all', label: '全部', hidden: false }] }
    ],
    keyword: { visible: true, label: '名称', placeholder: '请输入项目名称' }
}
const filtersCfg = reactive(JSON.parse(JSON.stringify(DEFAULT_FILTERS)))

const selectValues = reactive({})
const q = reactive({ keyword: '' })

const visibleSelects = computed(() => filtersCfg.selects.filter(g => g.visible))
const showFilterSection = computed(() =>
    visibleSelects.value.length > 0 || filtersCfg.keyword.visible
)

// 初始化 selectValues：默认不选中任何值，让 placeholder（组标题）显示
const syncSelectValues = () => {
    for (const g of filtersCfg.selects) {
        if (!(g.key in selectValues)) selectValues[g.key] = ''
    }
}

// ---------- 加载配置 ----------
const load = async () => {
    try {
        const [e, f] = await Promise.allSettled([
            api.get('/settings/exhibits'),
            api.get('/settings/filters')
        ])
        if (e.status === 'fulfilled' && e.value?.items?.length) {
            exhibits.value = e.value.items
        }
        if (f.status === 'fulfilled' && f.value?.filters) {
            Object.assign(filtersCfg, f.value.filters)
        }
    } catch { /* fallback 已默认 */ }
    syncSelectValues()
}

const onSearch = () => router.push({ path: '/projects', query: { ...selectValues, keyword: q.keyword } })
const onReset = () => {
    for (const g of filtersCfg.selects) {
        selectValues[g.key] = ''
    }
    q.keyword = ''
}

onMounted(load)
</script>

<style scoped>
/* ============ 展览 list（纯色 · hover 展开 · 竖排字） ============ */
.resources1 {
    padding: 30px 24px;
    background: var(--color-bg);
}
.x-wrap {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0;
}

/* 手风琴容器：紧凑高度，图片按高度等比缩放 */
.list {
    display: flex;
    gap: 0;
    background: #1a0e08;
    height: 480px;                        /* 紧凑高度 */
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;
}

.item {
    flex: 0 0 160px;                      /* 默认窄条：露出图片中央 */
    height: 100%;
    position: relative;
    overflow: hidden;
    text-decoration: none;
    display: block;
    transition: flex-basis .7s cubic-bezier(.2, .9, .3, 1);
    border-right: 1px solid rgba(0,0,0,.55);
}
.item:last-child { border-right: none; }

/* hover / act 项：约等于图片按高度缩放后的宽度（480 × 488/672 ≈ 349） */
.item.act {
    flex: 0 0 350px;
}

/* 有图时不加半透明遮罩，只在文字下方加渐变增强可读性 */

.h18 {
    position: absolute;
    top: 32px;
    left: 22px;
    writing-mode: vertical-rl;
    text-orientation: upright;
    color: rgba(245, 232, 200, .95);
    font-family: var(--font-serif);
    font-size: 18px;
    letter-spacing: 12px;
    line-height: 1;
    max-height: calc(100% - 64px);
    z-index: 3;
    text-shadow: 0 2px 12px rgba(0, 0, 0, .85), 0 0 4px rgba(0, 0, 0, .6);
    transition: font-size .5s, letter-spacing .5s, color .3s;
    font-weight: 500;
}
.item.act .h18 {
    color: #F4E4A8;
    font-size: 22px;
    letter-spacing: 16px;
    font-weight: 600;
}
.item.act .h18::before {
    content: '';
    position: absolute;
    top: -14px; left: 50%;
    transform: translateX(-50%);
    width: 2px; height: 22px;
    background: #C9A961;
}

/* 图片：高度铺满保持原比例，宽度自动；左对齐
   未激活时露出图片"最左侧"一段，激活展开后完整可见 */
.art-img {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: auto;
    max-width: none;
    z-index: 1;
    display: block;
    pointer-events: none;
    opacity: 0;
    transition: opacity .45s ease;
}
.art-img.loaded {
    opacity: 1;
}
/* SVG 装饰：套一个背景色框，居中显示 */
.art-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}
.art-svg :deep(svg) {
    width: 68%;
    height: 82%;
    max-height: 82%;
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, .6));
}
.item.act .art { opacity: 1; }
.item:not(.act) .art { transform: translate(-50%, -50%) scale(.75); }

/* ============ 查询筛选（ihchina.cn/project.html 风格：横排） ============ */
.screen-mod {
    padding: 40px 24px;
    background: var(--color-bg);
}
.screen-wrap {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    gap: 10px;
    align-items: stretch;
    flex-wrap: wrap;
}
.screen-wrap .sel {
    flex: 1;
    min-width: 180px;
}
.screen-wrap :deep(.el-input__wrapper),
.screen-wrap :deep(.el-select__wrapper) {
    height: 44px;
    box-shadow: 0 0 0 1px var(--color-border) inset;
    border-radius: 2px;
    padding: 0 14px;
    background: #fff;
}
.screen-wrap :deep(.el-input__wrapper.is-focus),
.screen-wrap :deep(.el-select__wrapper.is-focused) {
    box-shadow: 0 0 0 1px var(--color-primary) inset;
}
.screen-wrap :deep(.el-input__inner),
.screen-wrap :deep(.el-select__placeholder) {
    font-size: 14px;
    color: var(--color-text);
}
.submit-btn {
    height: 44px !important;
    padding: 0 32px !important;
    font-size: 14px;
    letter-spacing: 2px;
    border-radius: 2px !important;
}

@media (max-width: 1024px) {
    .list { height: 420px; }
    .h18 { font-size: 16px; letter-spacing: 8px; }
    .item.act .h18 { font-size: 20px; letter-spacing: 12px; }
}
@media (max-width: 640px) {
    .list { flex-direction: column; height: auto; }
    .item { flex: none; height: 80px; transition: height .5s; }
    .item.act { height: 300px; }
    .h18 {
        writing-mode: horizontal-tb;
        text-orientation: initial;
        top: 20px; left: 20px;
        font-size: 16px; letter-spacing: 4px;
    }
    .item.act .h18 { font-size: 20px; letter-spacing: 6px; }
}
</style>
