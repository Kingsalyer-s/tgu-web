import express from 'express'
import db from '../db.js'
import { authRequired, adminRequired } from '../auth.js'

const router = express.Router()

// ============== 公开：文章列表 ==============
router.get('/', (req, res) => {
    const {
        category = '',
        type = '',
        keyword = '',
        ids = '',
        sortBy = 'latest',
        page = 1,
        pageSize = 20
    } = req.query

    // 按 ID 列表精确查询（保持传入顺序）
    if (ids) {
        const idList = String(ids).split(',').map(s => parseInt(s)).filter(Boolean)
        if (!idList.length) return res.json({ total: 0, items: [] })
        const placeholders = idList.map(() => '?').join(',')
        const rows = db.prepare(`
            SELECT id, category, type, title, excerpt, cover, tags, date, views
            FROM articles WHERE id IN (${placeholders})
        `).all(...idList)
        // 按传入 ids 顺序返回
        const map = new Map(rows.map(r => [r.id, r]))
        const items = idList
            .map(id => map.get(id))
            .filter(Boolean)
            .map(r => ({ ...r, tags: (r.tags || '').split(',').filter(Boolean) }))
        return res.json({ total: items.length, items })
    }

    const conds = ['published = 1']
    const params = {}
    if (category) { conds.push('category = @category'); params.category = category }
    if (type)     { conds.push('type = @type');         params.type = type }
    if (keyword)  { conds.push('(title LIKE @kw OR excerpt LIKE @kw)'); params.kw = `%${keyword}%` }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
    const orderBy = sortBy === 'views' ? 'views DESC, date DESC' : 'date DESC, id DESC'

    const limit = Math.min(100, Math.max(1, parseInt(pageSize) || 20))
    const offset = (Math.max(1, parseInt(page) || 1) - 1) * limit

    const total = db.prepare(`SELECT COUNT(*) as c FROM articles ${where}`).get(params).c
    const rows = db.prepare(`
        SELECT id, category, type, title, excerpt, cover, tags, date, views
        FROM articles ${where}
        ORDER BY ${orderBy}
        LIMIT ${limit} OFFSET ${offset}
    `).all(params)

    res.json({
        total,
        page: Number(page),
        pageSize: limit,
        items: rows.map(r => ({ ...r, tags: (r.tags || '').split(',').filter(Boolean) }))
    })
})

// ============== 公开：详情 ==============
router.get('/:id', (req, res) => {
    const row = db.prepare(`SELECT * FROM articles WHERE id = ? AND published = 1`).get(req.params.id)
    if (!row) return res.status(404).json({ message: '内容不存在' })
    // 浏览量+1
    db.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').run(req.params.id)
    res.json({ item: { ...row, tags: (row.tags || '').split(',').filter(Boolean) } })
})

// 上下篇（同 category）
router.get('/:id/neighbors', (req, res) => {
    const cur = db.prepare(`SELECT id, category, date FROM articles WHERE id = ? AND published = 1`).get(req.params.id)
    if (!cur) return res.status(404).json({ message: '内容不存在' })
    const prev = db.prepare(`
        SELECT id, title FROM articles
        WHERE published = 1 AND category = @cat AND (date > @d OR (date = @d AND id > @id))
        ORDER BY date ASC, id ASC LIMIT 1
    `).get({ cat: cur.category, d: cur.date, id: cur.id })
    const next = db.prepare(`
        SELECT id, title FROM articles
        WHERE published = 1 AND category = @cat AND (date < @d OR (date = @d AND id < @id))
        ORDER BY date DESC, id DESC LIMIT 1
    `).get({ cat: cur.category, d: cur.date, id: cur.id })
    res.json({ prev: prev || null, next: next || null })
})

// 相关推荐（同 category，随机 6 篇）
router.get('/:id/related', (req, res) => {
    const cur = db.prepare(`SELECT category FROM articles WHERE id = ? AND published = 1`).get(req.params.id)
    if (!cur) return res.status(404).json({ message: '内容不存在' })
    const items = db.prepare(`
        SELECT id, category, type, title, excerpt, cover, tags, date, views
        FROM articles
        WHERE published = 1 AND category = ? AND id != ?
        ORDER BY RANDOM() LIMIT 6
    `).all(cur.category, req.params.id)
    res.json({
        items: items.map(r => ({ ...r, tags: (r.tags || '').split(',').filter(Boolean) }))
    })
})

// ============== 统计：需要登录 ==============
router.get('/stats/summary', adminRequired, (req, res) => {
    const totalArticles = db.prepare('SELECT COUNT(*) as c FROM articles').get().c
    const published = db.prepare('SELECT COUNT(*) as c FROM articles WHERE published = 1').get().c
    const totalViews = db.prepare('SELECT SUM(views) as s FROM articles').get().s || 0
    const categoryCounts = {}
    db.prepare('SELECT category, COUNT(*) as c FROM articles GROUP BY category').all()
        .forEach(row => { categoryCounts[row.category] = row.c })
    res.json({ totalArticles, published, totalViews, totalCategories: Object.keys(categoryCounts).length || 9, categoryCounts })
})

// ============== 管理：新建 ==============
router.post('/', adminRequired, (req, res) => {
    const {
        category, type = 'article', title, excerpt = '', content = '',
        cover = '', tags = [], date = new Date().toISOString().slice(0, 10), published = true
    } = req.body || {}
    if (!category || !title) return res.status(400).json({ message: '栏目和标题不能为空' })

    const result = db.prepare(`
        INSERT INTO articles (category, type, title, excerpt, content, cover, tags, date, published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(category, type, title, excerpt, content, cover, Array.isArray(tags) ? tags.join(',') : String(tags), date, published ? 1 : 0)
    res.status(201).json({ id: result.lastInsertRowid })
})

// ============== 管理：更新 ==============
router.put('/:id', adminRequired, (req, res) => {
    const cur = db.prepare('SELECT id FROM articles WHERE id = ?').get(req.params.id)
    if (!cur) return res.status(404).json({ message: '内容不存在' })

    const {
        category, type, title, excerpt, content, cover, tags, date, published
    } = req.body || {}

    db.prepare(`
        UPDATE articles SET
            category = COALESCE(@category, category),
            type = COALESCE(@type, type),
            title = COALESCE(@title, title),
            excerpt = COALESCE(@excerpt, excerpt),
            content = COALESCE(@content, content),
            cover = COALESCE(@cover, cover),
            tags = COALESCE(@tags, tags),
            date = COALESCE(@date, date),
            published = COALESCE(@published, published),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `).run({
        id: req.params.id,
        category, type, title, excerpt, content, cover,
        tags: tags === undefined ? undefined : (Array.isArray(tags) ? tags.join(',') : String(tags)),
        date,
        published: published === undefined ? undefined : (published ? 1 : 0)
    })
    res.json({ ok: true })
})

// ============== 管理：删除 ==============
router.delete('/:id', adminRequired, (req, res) => {
    db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id)
    res.json({ ok: true })
})

export default router
