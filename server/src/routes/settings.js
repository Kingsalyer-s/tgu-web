import express from 'express'
import db from '../db.js'
import { adminRequired } from '../auth.js'

db.exec(`
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`)

// ============== 默认值 ==============
const DEFAULT_EXHIBITS = [
    { title: '太极拳',                  link: '/projects',   color: '#2C1810', artKey: 'mask',        image: '', hideTitle: false },
    { title: '宣纸传统制作技艺',        link: '/projects',   color: '#4A2E1B', artKey: 'vase',        image: '', hideTitle: false },
    { title: '掐丝彩砂制作技艺',        link: '/simulation', color: '#74256A', artKey: 'qiansi',      image: '', hideTitle: false },
    { title: '2026 文化和自然遗产日',   link: '/news',       color: '#C9A961', artKey: 'lantern',     image: '', hideTitle: false },
    { title: '2026 非遗过大年春节专题', link: '/courses',    color: '#8B1E10', artKey: 'embroidery',  image: '', hideTitle: false }
]

const DEFAULT_FILTERS = {
    selects: [
        {
            key: 'location',
            visible: true,
            label: '地点',
            options: [
                { value: 'all', label: '全部',           hidden: false },
                { value: 'bj',  label: '北京市',         hidden: false },
                { value: 'tj',  label: '天津市',         hidden: false },
                { value: 'hb',  label: '河北省',         hidden: false },
                { value: 'sx',  label: '山西省',         hidden: false },
                { value: 'nmg', label: '内蒙古自治区',   hidden: false },
                { value: 'ln',  label: '辽宁省',         hidden: false },
                { value: 'jl',  label: '吉林省',         hidden: false },
                { value: 'hlj', label: '黑龙江省',       hidden: false },
                { value: 'sh',  label: '上海市',         hidden: false },
                { value: 'js',  label: '江苏省',         hidden: false },
                { value: 'zj',  label: '浙江省',         hidden: false }
            ]
        },
        {
            key: 'publishDate',
            visible: true,
            label: '公布时间',
            options: [
                { value: 'all', label: '全部',       hidden: false },
                { value: '1',   label: '2006(第一批)', hidden: false },
                { value: '2',   label: '2008(第二批)', hidden: false },
                { value: '3',   label: '2011(第三批)', hidden: false },
                { value: '4',   label: '2014(第四批)', hidden: false },
                { value: '5',   label: '2021(第五批)', hidden: false }
            ]
        },
        {
            key: 'category',
            visible: true,
            label: '类别',
            options: [
                { value: 'all',    label: '全部',              hidden: false },
                { value: 'wenxue', label: '民间文学',          hidden: false },
                { value: 'yinyue', label: '传统音乐',          hidden: false },
                { value: 'wudao',  label: '传统舞蹈',          hidden: false },
                { value: 'xiju',   label: '传统戏剧',          hidden: false },
                { value: 'quyi',   label: '曲艺',              hidden: false },
                { value: 'tiyu',   label: '传统体育、游艺与杂技', hidden: false },
                { value: 'meishu', label: '传统美术',          hidden: false },
                { value: 'jiyi',   label: '传统技艺',          hidden: false },
                { value: 'yiyao',  label: '传统医药',          hidden: false },
                { value: 'minsu',  label: '民俗',              hidden: false }
            ]
        },
        {
            key: 'subtype',
            visible: true,
            label: '类型',
            options: [
                { value: 'all', label: '全部',     hidden: false },
                { value: 'new', label: '新增项目', hidden: false },
                { value: 'ext', label: '扩展项目', hidden: false }
            ]
        }
    ],
    keyword: {
        visible: true,
        label: '名称',
        placeholder: '请输入项目名称'
    }
}

// 首页底部三栏资讯模块（对应 HomeBottomColumns 组件）
const DEFAULT_NEWS_COLUMNS = [
    { key: 'left',   title: '非遗资讯', category: 'news',     link: '/news',     count: 6, showFeatured: true,  showBanner: false, mode: 'auto', itemIds: [] },
    { key: 'center', title: '文创产品', category: 'cultural', link: '/cultural', count: 3, showFeatured: false, showBanner: false, mode: 'auto', itemIds: [] },
    { key: 'right',  title: '学术专题', category: 'academic', link: '/academic', count: 4, showFeatured: false, showBanner: true,  mode: 'auto', itemIds: [] }
]

const DEFAULT_SITE = {
    name: '非遗工艺数字化辅助设计与教学平台',
    nameEn: 'INTANGIBLE HERITAGE · DIGITAL DESIGN & TEACHING',
    description: '本平台致力于非物质文化遗产工艺的数字化保存、教学传承与创新设计，融合学术研究、教育实践与文创转化，构建从课堂到产业的完整生态。',
    linkColumns: [
        {
            title: '快速导航',
            links: [
                { name: '非遗项目',   url: '/projects',   external: false },
                { name: '数字仿真',   url: '/simulation', external: false },
                { name: '图案纹样',   url: '/patterns',   external: false },
                { name: '材料汇总',   url: '/materials',  external: false },
                { name: '课程鉴赏',   url: '/courses',    external: false }
            ]
        },
        {
            title: '关于平台',
            links: [
                { name: '关于我们',       url: '/contact',   external: false },
                { name: '联系我们',       url: '/contact',   external: false },
                { name: '平台服务协议',   url: '#',          external: false },
                { name: '隐私保护政策',   url: '#',          external: false },
                { name: '旅程链接',       url: '#',          external: false }
            ]
        }
    ],
    contactTitle: '关注我们',
    contactLines: [
        '邮箱：contact@heritage-edu.cn',
        '电话：400-XXX-XXXX',
        '地址：中国 · 高校产学研基地',
        '工作时间：周一至周五 9:00-17:30'
    ],
    friendLinks: [
        { name: '中国非物质文化遗产网', url: 'https://www.ihchina.cn' },
        { name: '国家文物局',           url: 'https://www.ncha.gov.cn' },
        { name: '教育部',               url: 'https://www.moe.gov.cn' },
        { name: '文化和旅游部',         url: 'https://www.mct.gov.cn' }
    ],
    copyright: '© 2026 非遗工艺数字化辅助设计与教学平台 · 传承匠心 · 数以载道'
}

const readKey = key => {
    const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key)
    if (!row) return null
    try { return JSON.parse(row.value) } catch { return null }
}
const writeKey = (key, value) => {
    db.prepare(`
        INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(key, JSON.stringify(value))
}

const ART_KEYS = ['mask', 'vase', 'qiansi', 'lantern', 'embroidery', 'none']
const HEX_RE = /^#[0-9A-Fa-f]{3,8}$/

const router = express.Router()

// ============== 展览项 ==============
router.get('/exhibits', (req, res) => {
    const items = readKey('exhibits') || DEFAULT_EXHIBITS
    res.json({ items })
})

router.put('/exhibits', adminRequired, (req, res) => {
    const { items } = req.body || {}
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items 必须是数组' })
    if (items.length < 3 || items.length > 6) {
        return res.status(400).json({ message: '展览项数量必须在 3 - 6 之间' })
    }
    const clean = []
    for (const [i, it] of items.entries()) {
        if (!it.title || typeof it.title !== 'string') {
            return res.status(400).json({ message: `第 ${i + 1} 项：标题必填` })
        }
        if (!it.link || typeof it.link !== 'string') {
            return res.status(400).json({ message: `第 ${i + 1} 项：超链接必填` })
        }
        if (!HEX_RE.test(it.color || '')) {
            return res.status(400).json({ message: `第 ${i + 1} 项：颜色需为 #hex 格式` })
        }
        if (!ART_KEYS.includes(it.artKey || 'none')) {
            return res.status(400).json({ message: `第 ${i + 1} 项：前景图仅可为 ${ART_KEYS.join('/')}` })
        }
        clean.push({
            title: String(it.title).slice(0, 40),
            link: String(it.link).slice(0, 200),
            color: it.color,
            artKey: it.artKey || 'none',
            image: typeof it.image === 'string' ? it.image.slice(0, 500) : '',
            hideTitle: !!it.hideTitle
        })
    }
    writeKey('exhibits', clean)
    res.json({ ok: true, items: clean })
})

// ============== 查询筛选 ==============
router.get('/filters', (req, res) => {
    const filters = readKey('filters') || DEFAULT_FILTERS
    res.json({ filters })
})

router.put('/filters', adminRequired, (req, res) => {
    const f = req.body?.filters
    if (!f || typeof f !== 'object') return res.status(400).json({ message: 'filters 必填' })
    if (!Array.isArray(f.selects)) return res.status(400).json({ message: 'selects 必须是数组' })
    if (f.selects.length > 10) return res.status(400).json({ message: '筛选下拉组不能超过 10 个' })

    const clean = {
        selects: f.selects.map((g, i) => ({
            key: String(g.key || `sel_${i}`).slice(0, 30),
            visible: !!(g.visible ?? true),
            label: String(g.label || '未命名').slice(0, 20),
            options: (Array.isArray(g.options) ? g.options : []).map(o => ({
                value: String(o.value || '').slice(0, 30),
                label: String(o.label || '').slice(0, 30),
                hidden: !!o.hidden
            })).filter(o => o.value && o.label)
        })),
        keyword: {
            visible: !!(f.keyword?.visible ?? true),
            label: String(f.keyword?.label || '名称').slice(0, 20),
            placeholder: String(f.keyword?.placeholder || '').slice(0, 100)
        }
    }
    writeKey('filters', clean)
    res.json({ ok: true, filters: clean })
})

// ============== 站点基本信息 ==============
router.get('/site', (req, res) => {
    const site = readKey('site') || DEFAULT_SITE
    res.json({ site })
})

router.put('/site', adminRequired, (req, res) => {
    const s = req.body?.site || req.body || {}
    // 合并默认避免缺字段；对数组类字段直接采用请求值（若提供）
    const site = {
        ...DEFAULT_SITE,
        ...s,
        linkColumns: Array.isArray(s.linkColumns) ? s.linkColumns : DEFAULT_SITE.linkColumns,
        contactLines: Array.isArray(s.contactLines) ? s.contactLines : DEFAULT_SITE.contactLines,
        friendLinks: Array.isArray(s.friendLinks) ? s.friendLinks : DEFAULT_SITE.friendLinks
    }
    writeKey('site', site)
    res.json({ ok: true, site })
})

// ============== 首页资讯三栏配置 ==============
router.get('/news-columns', (req, res) => {
    const columns = readKey('news_columns') || DEFAULT_NEWS_COLUMNS
    res.json({ columns })
})

router.put('/news-columns', adminRequired, (req, res) => {
    const cols = req.body?.columns
    if (!Array.isArray(cols) || cols.length !== 3) {
        return res.status(400).json({ message: '必须提供 3 个栏目配置' })
    }
    const clean = cols.map((c, i) => ({
        key: ['left', 'center', 'right'][i],
        title: String(c.title || '未命名').slice(0, 30),
        category: String(c.category || '').slice(0, 30),
        link: String(c.link || '/').slice(0, 200),
        count: Math.max(1, Math.min(20, parseInt(c.count) || 5)),
        showFeatured: !!c.showFeatured,
        showBanner: !!c.showBanner,
        mode: c.mode === 'manual' ? 'manual' : 'auto',
        itemIds: Array.isArray(c.itemIds)
            ? c.itemIds.map(x => parseInt(x)).filter(Boolean).slice(0, 20)
            : []
    }))
    writeKey('news_columns', clean)
    res.json({ ok: true, columns: clean })
})

// ============== 恢复默认 ==============
router.post('/reset/:key', adminRequired, (req, res) => {
    const map = {
        exhibits: DEFAULT_EXHIBITS,
        filters: DEFAULT_FILTERS,
        site: DEFAULT_SITE,
        news_columns: DEFAULT_NEWS_COLUMNS
    }
    const val = map[req.params.key]
    if (!val) return res.status(400).json({ message: '未知的配置项' })
    writeKey(req.params.key, val)
    res.json({ ok: true })
})

export default router
