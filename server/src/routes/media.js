import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../db.js'
import { adminRequired } from '../auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = process.env.UPLOAD_DIR
    || (process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'uploads') : path.join(__dirname, '..', 'uploads'))

const router = express.Router()
router.use(adminRequired)

// 列表（分页 + kind 过滤）
router.get('/', (req, res) => {
    const { kind = '', page = 1, pageSize = 24 } = req.query
    const conds = []
    const params = {}
    if (kind) { conds.push('kind = @kind'); params.kind = kind }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
    const limit = Math.min(100, parseInt(pageSize) || 24)
    const offset = (Math.max(1, parseInt(page) || 1) - 1) * limit
    const total = db.prepare(`SELECT COUNT(*) as c FROM media ${where}`).get(params).c
    const items = db.prepare(`
        SELECT id, url, filename, original_name, mime, size, kind, uploader_id, created_at
        FROM media ${where}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
    `).all(params)
    res.json({ total, page: Number(page), pageSize: limit, items })
})

// 删除（同步删磁盘文件）
router.delete('/:id', (req, res) => {
    const row = db.prepare('SELECT filename FROM media WHERE id = ?').get(req.params.id)
    if (!row) return res.status(404).json({ message: '不存在' })
    if (row.filename) {
        const p = path.join(UPLOAD_DIR, row.filename)
        try { if (fs.existsSync(p)) fs.unlinkSync(p) } catch {}
    }
    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id)
    res.json({ ok: true })
})

export default router
