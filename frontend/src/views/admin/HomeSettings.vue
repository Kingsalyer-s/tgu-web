<template>
    <div class="admin-page" v-loading="loading">
        <h1 class="page-title">首页设置</h1>

        <el-tabs v-model="active" class="hp-tabs">
            <!-- ============== 展览项 ============== -->
            <el-tab-pane label="展览列表" name="exhibits">
                <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
                    展览列表用于首页顶部大图 hover 展开效果。数量 3 - 6 项。标题可勾选"不显示"以纯图形式展现。
                </el-alert>

                <div class="ex-list">
                    <div v-for="(ex, i) in exhibits" :key="i" class="ex-item">
                        <div class="ex-index">{{ i + 1 }}</div>

                        <div class="ex-preview" :style="{ background: ex.color }">
                            <div v-if="!ex.hideTitle" class="ex-preview-title">{{ ex.title || '（未命名）' }}</div>
                            <img v-if="ex.image" :src="ex.image" class="ex-preview-img" alt="preview">
                            <div v-else-if="ex.artKey && ex.artKey !== 'none'" class="ex-preview-art" v-html="ART[ex.artKey]"></div>
                        </div>

                        <div class="ex-fields">
                            <el-form label-width="80px" size="default">
                                <el-form-item label="标题">
                                    <el-input v-model="ex.title" placeholder="展览项标题" maxlength="40" show-word-limit />
                                </el-form-item>
                                <el-form-item label="超链接">
                                    <el-input v-model="ex.link" placeholder="/projects 或 https://...">
                                        <template #prepend>
                                            <el-select v-model="ex.linkType" style="width: 100px;" @change="onLinkTypeChange(ex)">
                                                <el-option label="站内" value="internal" />
                                                <el-option label="外部" value="external" />
                                            </el-select>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="背景色">
                                    <el-color-picker v-model="ex.color" />
                                    <span class="hex-code">{{ ex.color }}</span>
                                </el-form-item>
                                <el-form-item label="前景图">
                                    <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                                        <div style="display: flex; gap: 8px;">
                                            <el-upload
                                                :show-file-list="false"
                                                :action="uploadUrl"
                                                :headers="uploadHeaders"
                                                :before-upload="beforeUpload"
                                                :on-success="res => onUploadSuccess(res, ex)"
                                            >
                                                <el-button size="small" type="primary" plain>
                                                    <el-icon><Upload /></el-icon>&nbsp;上传图片
                                                </el-button>
                                            </el-upload>
                                            <el-button v-if="ex.image" size="small" type="danger" plain @click="ex.image = ''">清除图片</el-button>
                                        </div>
                                        <el-input v-model="ex.image" size="small" placeholder="或粘贴图片 URL（留空则用下方预设图形）" />
                                        <el-select v-model="ex.artKey" size="small" style="width: 100%;" :disabled="!!ex.image">
                                            <el-option label="预设：无（纯色）"   value="none" />
                                            <el-option label="预设：京剧脸谱"    value="mask" />
                                            <el-option label="预设：景泰蓝花瓶"  value="vase" />
                                            <el-option label="预设：掐丝彩砂"    value="qiansi" />
                                            <el-option label="预设：宫灯"        value="lantern" />
                                            <el-option label="预设：刺绣"        value="embroidery" />
                                        </el-select>
                                    </div>
                                </el-form-item>
                                <el-form-item>
                                    <el-checkbox v-model="ex.hideTitle">不显示标题（纯图片展示）</el-checkbox>
                                </el-form-item>
                            </el-form>
                        </div>

                        <div class="ex-actions">
                            <el-button-group>
                                <el-button size="small" :disabled="i === 0" @click="moveExhibit(i, -1)" title="上移">↑</el-button>
                                <el-button size="small" :disabled="i === exhibits.length - 1" @click="moveExhibit(i, 1)" title="下移">↓</el-button>
                            </el-button-group>
                            <el-button size="small" type="danger" :disabled="exhibits.length <= 3" @click="removeExhibit(i)">删除</el-button>
                        </div>
                    </div>
                </div>

                <div class="add-row">
                    <el-button type="primary" plain :disabled="exhibits.length >= 6" @click="addExhibit">
                        <el-icon><Plus /></el-icon>&nbsp;添加展览项（{{ exhibits.length }} / 6）
                    </el-button>
                    <el-button @click="resetExhibits">恢复默认</el-button>
                </div>

                <div class="save-bar">
                    <el-button type="primary" size="large" @click="saveExhibits" :loading="saving">保存展览列表</el-button>
                </div>
            </el-tab-pane>

            <!-- ============== 查询筛选 ============== -->
            <el-tab-pane label="查询筛选" name="filters">
                <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
                    首页搜索栏支持任意数量的下拉筛选组 + 一个关键词输入框。每组可编辑名称、选项、显隐；每个选项也可单独隐藏。
                </el-alert>

                <!-- 动态下拉筛选组 -->
                <div v-for="(g, gi) in filters.selects" :key="gi" class="filter-group">
                    <div class="fg-header">
                        <div class="fg-header-left">
                            <span class="fg-index">下拉筛选 #{{ gi + 1 }}</span>
                            <el-input v-model="g.label" placeholder="显示名称，如：地点" style="width: 180px;" size="default" />
                            <el-input v-model="g.key" placeholder="标识 key，如：location" style="width: 180px;" size="default" />
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <el-switch v-model="g.visible" active-text="显示" inactive-text="隐藏" />
                            <el-button-group>
                                <el-button size="small" :disabled="gi === 0" @click="moveSelect(gi, -1)" title="上移">↑</el-button>
                                <el-button size="small" :disabled="gi === filters.selects.length - 1" @click="moveSelect(gi, 1)" title="下移">↓</el-button>
                            </el-button-group>
                            <el-button size="small" type="danger" link @click="filters.selects.splice(gi, 1)">删除本组</el-button>
                        </div>
                    </div>
                    <el-table :data="g.options" size="small" border style="margin-top: 12px;">
                        <el-table-column label="标识 value" width="180">
                            <template #default="{ row }"><el-input v-model="row.value" size="small" /></template>
                        </el-table-column>
                        <el-table-column label="显示名称 label" width="240">
                            <template #default="{ row }"><el-input v-model="row.label" size="small" /></template>
                        </el-table-column>
                        <el-table-column label="隐藏该选项" width="120">
                            <template #default="{ row }"><el-switch v-model="row.hidden" /></template>
                        </el-table-column>
                        <el-table-column label="操作" width="120">
                            <template #default="{ $index }">
                                <el-button size="small" type="danger" link @click="g.options.splice($index, 1)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-button size="small" style="margin-top: 10px;" @click="g.options.push({ value: '', label: '', hidden: false })">
                        <el-icon><Plus /></el-icon>&nbsp;添加选项
                    </el-button>
                </div>

                <div style="text-align: center; padding: 16px 0; border-bottom: 1px solid var(--color-border); margin-bottom: 20px;">
                    <el-button type="primary" plain :disabled="filters.selects.length >= 10" @click="addSelectGroup">
                        <el-icon><Plus /></el-icon>&nbsp;新增下拉筛选组（{{ filters.selects.length }} / 10）
                    </el-button>
                </div>

                <!-- 关键词输入 -->
                <div class="filter-group">
                    <div class="fg-header">
                        <div class="fg-header-left">
                            <span class="fg-index">关键词输入</span>
                            <el-input v-model="filters.keyword.label" placeholder="名称，如：名称" style="width: 180px;" size="default" />
                        </div>
                        <el-switch v-model="filters.keyword.visible" active-text="显示" inactive-text="隐藏" />
                    </div>
                    <el-form label-width="100px" style="margin-top: 12px;">
                        <el-form-item label="占位提示">
                            <el-input v-model="filters.keyword.placeholder" placeholder="输入框的 placeholder" style="max-width: 500px;" />
                        </el-form-item>
                    </el-form>
                </div>

                <div class="save-bar">
                    <el-button @click="resetFilters">恢复默认</el-button>
                    <el-button type="primary" size="large" @click="saveFilters" :loading="saving">保存筛选配置</el-button>
                </div>
            </el-tab-pane>

            <!-- ============== 资讯模块 ============== -->
            <el-tab-pane label="资讯模块" name="news-columns">
                <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
                    首页底部三栏（左/中/右），每栏关联一个内容栏目并从中拉取最新内容。左栏支持"焦点图"，右栏支持"底部大图"。
                </el-alert>

                <div v-for="(col, i) in newsColumns" :key="i" class="filter-group">
                    <div class="fg-header">
                        <div class="fg-header-left">
                            <span class="fg-index">{{ ['左栏','中栏','右栏'][i] }}</span>
                        </div>
                    </div>
                    <el-form label-width="110px" style="margin-top: 12px; max-width: 900px;">
                        <el-form-item label="栏目标题">
                            <el-input v-model="col.title" placeholder="如：非遗资讯" maxlength="20" show-word-limit />
                        </el-form-item>
                        <el-form-item label="更多链接">
                            <el-input v-model="col.link" placeholder="/news 或 https://..." style="width: 320px;" />
                        </el-form-item>

                        <el-form-item label="内容来源">
                            <el-radio-group v-model="col.mode">
                                <el-radio-button value="auto">按分类自动</el-radio-button>
                                <el-radio-button value="manual">手动指定</el-radio-button>
                            </el-radio-group>
                        </el-form-item>

                        <template v-if="col.mode === 'auto'">
                            <el-form-item label="绑定分类">
                                <el-select v-model="col.category" style="width: 260px;">
                                    <el-option v-for="c in CATEGORIES" :key="c.value" :label="c.label" :value="c.value" />
                                </el-select>
                                <span style="margin-left: 12px; color: #999; font-size: 12px;">
                                    从此分类拉取最新内容
                                </span>
                            </el-form-item>
                            <el-form-item label="显示条数">
                                <el-input-number v-model="col.count" :min="1" :max="15" />
                            </el-form-item>
                        </template>

                        <template v-else>
                            <el-form-item label="选择内容">
                                <el-select
                                    v-model="col.itemIds"
                                    multiple
                                    filterable
                                    remote
                                    :remote-method="q => remoteSearch(i, q)"
                                    :loading="searchLoading"
                                    placeholder="输入标题搜索并选择要显示的内容"
                                    style="width: 100%; max-width: 700px;"
                                    value-key="id"
                                >
                                    <el-option
                                        v-for="opt in (searchOptions[i] || preloadedItems[i] || [])"
                                        :key="opt.id"
                                        :label="`[${categoryLabel(opt.category)}] ${opt.title}`"
                                        :value="opt.id"
                                    />
                                </el-select>
                                <div style="margin-top: 6px; color: #999; font-size: 12px;">
                                    可选择任意栏目的内容；上下顺序即前台显示顺序。
                                    <a style="color: var(--color-primary);" href="/admin/articles" target="_blank">前往内容管理 →</a>
                                </div>
                            </el-form-item>
                        </template>

                        <el-form-item v-if="i === 0" label="焦点图">
                            <el-switch v-model="col.showFeatured" active-text="第 1 条作为焦点大图" inactive-text="不显示焦点图" />
                        </el-form-item>
                        <el-form-item v-if="i === 2" label="底部大图">
                            <el-switch v-model="col.showBanner" active-text="最后 1 条作为底部大图" inactive-text="不显示底部大图" />
                        </el-form-item>
                    </el-form>
                </div>

                <div class="save-bar">
                    <el-button @click="resetNewsColumns">恢复默认</el-button>
                    <el-button type="primary" size="large" @click="saveNewsColumns" :loading="saving">保存资讯模块</el-button>
                </div>
            </el-tab-pane>

            <!-- ============== 页面底部 ============== -->
            <el-tab-pane label="页脚 Footer" name="footer">
                <el-form label-width="100px" size="default">
                    <el-form-item label="平台名称">
                        <el-input v-model="site.name" maxlength="50" />
                    </el-form-item>
                    <el-form-item label="英文名/副标">
                        <el-input v-model="site.nameEn" maxlength="80" />
                    </el-form-item>
                    <el-form-item label="平台简介">
                        <el-input v-model="site.description" type="textarea" :rows="3" maxlength="240" show-word-limit />
                    </el-form-item>
                    <el-form-item label="联系信息栏">
                        <div class="line-list">
                            <div v-for="(line, i) in site.contactLines" :key="i" class="line-row">
                                <el-input v-model="site.contactLines[i]" placeholder="每行一条：如「邮箱：xxx」" />
                                <el-button link type="danger" @click="site.contactLines.splice(i, 1)">删</el-button>
                            </div>
                            <el-button size="small" @click="site.contactLines.push('')">
                                <el-icon><Plus /></el-icon>&nbsp;添加一行
                            </el-button>
                        </div>
                    </el-form-item>
                    <el-form-item label="版权文字">
                        <el-input v-model="site.copyright" />
                    </el-form-item>
                </el-form>

                <h3 class="sub-title">链接分组（可拖动排序留待后续，目前按顺序）</h3>
                <div v-for="(col, ci) in site.linkColumns" :key="ci" class="filter-group">
                    <div class="fg-header">
                        <el-input v-model="col.title" style="width: 220px;" placeholder="分组标题" />
                        <el-button link type="danger" @click="site.linkColumns.splice(ci, 1)">删除该分组</el-button>
                    </div>
                    <el-table :data="col.links" size="small" border style="margin-top: 12px;">
                        <el-table-column label="链接名称" width="200">
                            <template #default="{ row }"><el-input v-model="row.name" size="small" /></template>
                        </el-table-column>
                        <el-table-column label="URL" min-width="240">
                            <template #default="{ row }"><el-input v-model="row.url" size="small" placeholder="/xxx 或 https://..." /></template>
                        </el-table-column>
                        <el-table-column label="外链" width="90">
                            <template #default="{ row }"><el-switch v-model="row.external" /></template>
                        </el-table-column>
                        <el-table-column label="操作" width="90">
                            <template #default="{ $index }">
                                <el-button size="small" type="danger" link @click="col.links.splice($index, 1)">删</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-button size="small" style="margin-top: 10px;" @click="col.links.push({ name: '', url: '', external: false })">
                        <el-icon><Plus /></el-icon>&nbsp;添加链接
                    </el-button>
                </div>
                <el-button style="margin-bottom: 20px;" @click="site.linkColumns.push({ title: '新分组', links: [] })">
                    <el-icon><Plus /></el-icon>&nbsp;新增分组
                </el-button>

                <h3 class="sub-title">友情链接</h3>
                <el-table :data="site.friendLinks" size="small" border>
                    <el-table-column label="名称" width="220">
                        <template #default="{ row }"><el-input v-model="row.name" size="small" /></template>
                    </el-table-column>
                    <el-table-column label="URL" min-width="240">
                        <template #default="{ row }"><el-input v-model="row.url" size="small" /></template>
                    </el-table-column>
                    <el-table-column label="操作" width="90">
                        <template #default="{ $index }">
                            <el-button size="small" type="danger" link @click="site.friendLinks.splice($index, 1)">删</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button size="small" style="margin-top: 10px;" @click="site.friendLinks.push({ name: '', url: '' })">
                    <el-icon><Plus /></el-icon>&nbsp;添加
                </el-button>

                <div class="save-bar">
                    <el-button @click="resetSite">恢复默认</el-button>
                    <el-button type="primary" size="large" @click="saveSite" :loading="saving">保存页脚设置</el-button>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import { cropToFixed } from '@/composables/useImageCrop'

const uploadUrl = '/api/upload/image'
const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
}))
// 上传前将图片裁剪缩放为固定 488×672 分辨率
const beforeUpload = async file => {
    if (file.size > 10 * 1024 * 1024) {
        ElMessage.error('原图不能超过 10MB')
        return false
    }
    try {
        return await cropToFixed(file, 488, 672, 0.9)
    } catch (e) {
        ElMessage.error(`图片处理失败：${e.message || e}`)
        return false
    }
}
const onUploadSuccess = (res, ex) => {
    if (res?.url) {
        ex.image = res.url
        ElMessage.success('上传成功（已自动裁剪为 488×672）')
    }
}

const active = ref('exhibits')
const loading = ref(false)
const saving = ref(false)

// --- 前景 SVG（与 Home.vue 同步用于预览） ---
const ART = {
    mask: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><path d="M100 30 Q140 30 155 70 Q170 120 160 170 Q140 220 100 240 Q60 220 40 170 Q30 120 45 70 Q60 30 100 30 Z" fill="#8B4513" stroke="#F4C87A" stroke-width="2"/><ellipse cx="80" cy="130" rx="10" ry="6" fill="#2C1810"/><ellipse cx="120" cy="130" rx="10" ry="6" fill="#2C1810"/><path d="M80 170 Q100 180 120 170" stroke="#C0392B" stroke-width="3" fill="none"/></svg>`,
    vase: `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg"><path d="M100 40 L120 60 Q140 90 130 130 Q160 150 165 200 Q170 260 140 290 Q145 320 130 350 Q125 370 100 370 Q75 370 70 350 Q55 320 60 290 Q30 260 35 200 Q40 150 70 130 Q60 90 80 60 Z" fill="#8B1E10" stroke="#F4C87A" stroke-width="2"/><ellipse cx="100" cy="50" rx="20" ry="5" fill="#C9A961"/></svg>`,
    qiansi: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><path d="M100 40 C130 40 155 65 150 100 C180 105 195 140 175 165 C185 195 165 220 135 210 C135 250 100 250 100 220 C100 250 65 250 65 210 C35 220 15 195 25 165 C5 140 20 105 50 100 C45 65 70 40 100 40 Z" fill="#C9A961" stroke="#F4E4A8" stroke-width="2"/><circle cx="100" cy="130" r="25" fill="#C0392B"/></svg>`,
    lantern: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="150" rx="80" ry="70" fill="#C0392B" stroke="#F4C87A" stroke-width="3"/><rect x="70" y="82" width="60" height="8" fill="#8B5A2B"/><rect x="70" y="210" width="60" height="8" fill="#8B5A2B"/></svg>`,
    embroidery: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="30" width="160" height="240" fill="rgba(0,0,0,.35)" stroke="#C9A961" stroke-width="2"/><circle cx="100" cy="120" r="45" fill="#E85A85"/></svg>`
}

const CATEGORIES = [
    { value: 'news',      label: '非遗资讯' },
    { value: 'theory',    label: '教育理论' },
    { value: 'projects',  label: '非遗项目' },
    { value: 'cultural',  label: '文创产品' },
    { value: 'patterns',  label: '图案纹样' },
    { value: 'materials', label: '材料汇总' },
    { value: 'brand',     label: '品牌发布' },
    { value: 'courses',   label: '课程鉴赏' },
    { value: 'academic',  label: '学术专题' }
]

const exhibits = ref([])
const filters = reactive({
    selects: [],
    keyword: { visible: true, label: '名称', placeholder: '请输入项目名称' }
})
const newsColumns = ref([])

// 每栏独立的搜索结果 & 已选项预加载
const searchOptions = ref({ 0: [], 1: [], 2: [] })
const preloadedItems = ref({ 0: [], 1: [], 2: [] })
const searchLoading = ref(false)

const categoryLabel = v => CATEGORIES.find(c => c.value === v)?.label || v

// 输入关键词远程搜索文章（覆盖到指定栏）
const remoteSearch = async (colIndex, keyword) => {
    if (!keyword) {
        searchOptions.value[colIndex] = []
        return
    }
    searchLoading.value = true
    try {
        const res = await api.get('/articles', { params: { keyword, pageSize: 20 } })
        searchOptions.value[colIndex] = res.items || []
    } finally {
        searchLoading.value = false
    }
}

// 加载后，预取每栏已选项以便下拉展示 label
const preloadSelectedItems = async () => {
    for (let i = 0; i < newsColumns.value.length; i++) {
        const col = newsColumns.value[i]
        if (col.mode === 'manual' && col.itemIds?.length) {
            try {
                const res = await api.get('/articles', { params: { ids: col.itemIds.join(',') } })
                preloadedItems.value[i] = res.items || []
            } catch { preloadedItems.value[i] = [] }
        }
    }
}

const addSelectGroup = () => {
    if (filters.selects.length >= 10) return
    filters.selects.push({
        key: `sel_${Date.now()}`,
        visible: true,
        label: '新筛选',
        options: [{ value: 'all', label: '全部', hidden: false }]
    })
}
const moveSelect = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= filters.selects.length) return
    ;[filters.selects[i], filters.selects[j]] = [filters.selects[j], filters.selects[i]]
}
const site = reactive({
    name: '', nameEn: '', description: '',
    linkColumns: [], contactTitle: '', contactLines: [],
    friendLinks: [], copyright: ''
})

const isExternalLink = url => typeof url === 'string' && /^https?:\/\//i.test(url)

const load = async () => {
    loading.value = true
    try {
        const [e, f, s, n] = await Promise.allSettled([
            api.get('/settings/exhibits'),
            api.get('/settings/filters'),
            api.get('/settings/site'),
            api.get('/settings/news-columns')
        ])
        if (e.status === 'fulfilled') {
            exhibits.value = (e.value.items || []).map(it => ({
                ...it,
                linkType: isExternalLink(it.link) ? 'external' : 'internal'
            }))
        }
        if (f.status === 'fulfilled') Object.assign(filters, f.value.filters || {})
        if (s.status === 'fulfilled') Object.assign(site, s.value.site || {})
        if (n.status === 'fulfilled') {
            newsColumns.value = (n.value.columns || []).map(c => ({
                mode: 'auto', itemIds: [], ...c
            }))
            await preloadSelectedItems()
        }
    } finally {
        loading.value = false
    }
}

const addExhibit = () => {
    if (exhibits.value.length >= 6) return
    exhibits.value.push({
        title: '新展览项',
        link: '/projects',
        color: '#74256A',
        artKey: 'none',
        image: '',
        hideTitle: false,
        linkType: 'internal'
    })
}
const removeExhibit = i => {
    if (exhibits.value.length <= 3) return
    exhibits.value.splice(i, 1)
}
const moveExhibit = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= exhibits.value.length) return
    const arr = exhibits.value
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
const onLinkTypeChange = ex => {
    if (ex.linkType === 'external' && !isExternalLink(ex.link)) ex.link = 'https://'
    if (ex.linkType === 'internal' && isExternalLink(ex.link)) ex.link = '/'
}

const resetExhibits = () => {
    ElMessageBox.confirm('确定恢复展览列表默认？', '提示', { type: 'warning' })
        .then(async () => {
            await api.post('/settings/reset/exhibits')
            ElMessage.success('已恢复默认')
            load()
        }).catch(() => {})
}
const resetFilters = () => {
    ElMessageBox.confirm('确定恢复筛选默认？', '提示', { type: 'warning' })
        .then(async () => {
            await api.post('/settings/reset/filters')
            ElMessage.success('已恢复默认')
            load()
        }).catch(() => {})
}
const resetSite = () => {
    ElMessageBox.confirm('确定恢复页脚默认？', '提示', { type: 'warning' })
        .then(async () => {
            await api.post('/settings/reset/site')
            ElMessage.success('已恢复默认')
            load()
        }).catch(() => {})
}

const saveExhibits = async () => {
    if (exhibits.value.length < 3 || exhibits.value.length > 6) {
        ElMessage.warning('数量必须在 3 - 6 之间')
        return
    }
    saving.value = true
    try {
        const items = exhibits.value.map(({ linkType, ...rest }) => rest)
        await api.put('/settings/exhibits', { items })
        ElMessage.success('展览列表已保存')
    } finally { saving.value = false }
}

const saveFilters = async () => {
    saving.value = true
    try {
        await api.put('/settings/filters', { filters })
        ElMessage.success('筛选配置已保存')
    } finally { saving.value = false }
}

const saveSite = async () => {
    saving.value = true
    try {
        await api.put('/settings/site', { site })
        ElMessage.success('页脚设置已保存')
    } finally { saving.value = false }
}

const saveNewsColumns = async () => {
    if (newsColumns.value.length !== 3) {
        ElMessage.warning('必须配置 3 个栏目')
        return
    }
    saving.value = true
    try {
        await api.put('/settings/news-columns', { columns: newsColumns.value })
        ElMessage.success('资讯模块已保存')
    } finally { saving.value = false }
}

const resetNewsColumns = () => {
    ElMessageBox.confirm('确定恢复资讯模块默认？', '提示', { type: 'warning' })
        .then(async () => {
            await api.post('/settings/reset/news_columns')
            ElMessage.success('已恢复默认')
            load()
        }).catch(() => {})
}

onMounted(load)
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
.hp-tabs :deep(.el-tabs__item.is-active) {
    color: var(--color-primary);
    font-weight: 700;
}
.hp-tabs :deep(.el-tabs__active-bar) { background: var(--color-primary); }

.ex-list { display: flex; flex-direction: column; gap: 20px; }
.ex-item {
    display: grid;
    grid-template-columns: 40px 180px 1fr 100px;
    gap: 20px;
    padding: 18px 0;
    border-bottom: 1px dashed var(--color-border);
    align-items: flex-start;
}
.ex-index {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    background: var(--color-primary);
    color: #fff;
    border-radius: 50%;
    font-weight: 700;
}
.ex-preview {
    aspect-ratio: 488 / 672;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--color-border);
}
.ex-preview-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.ex-preview-title {
    position: absolute;
    top: 12px; left: 12px;
    writing-mode: vertical-rl;
    text-orientation: upright;
    color: #F4E4A8;
    font-size: 13px;
    letter-spacing: 6px;
    z-index: 2;
    text-shadow: 0 1px 3px rgba(0,0,0,.6);
}
.ex-preview-art {
    position: absolute;
    inset: 15%;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}
.ex-preview-art :deep(svg) { width: 100%; height: 100%; }
.ex-fields { min-width: 0; }
.hex-code {
    margin-left: 12px;
    font-family: 'Courier New', monospace;
    color: var(--color-text-mute);
    font-size: 13px;
}
.ex-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
}

.add-row {
    padding: 20px 0;
    display: flex;
    gap: 12px;
    justify-content: center;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 20px;
}

.save-bar {
    padding: 30px 0 12px;
    text-align: right;
    border-top: 1px solid var(--color-border);
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.filter-group {
    padding: 20px 0;
    border-bottom: 1px dashed var(--color-border);
}
.fg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}
.fg-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}
.fg-index {
    display: inline-block;
    padding: 4px 12px;
    background: var(--color-primary);
    color: #fff;
    font-size: 12px;
    border-radius: 3px;
    letter-spacing: 1px;
}

.sub-title {
    font-size: 16px;
    color: var(--color-primary);
    margin: 24px 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border);
}
.line-list { display: flex; flex-direction: column; gap: 8px; max-width: 600px; }
.line-row { display: flex; gap: 8px; align-items: center; }
</style>
