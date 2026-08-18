import express from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { adminRequired } from '../auth.js'

const router = express.Router()

router.use(adminRequired)

// 列表（分页 + 关键词 + 角色/状态过滤）
router.get('/', (req, res) => {
    const {
        keyword = '',
        role = '',
        status = '',
        page = 1,
        pageSize = 20
    } = req.query

    const conds = []
    const params = {}
    if (keyword) { conds.push('username LIKE @kw'); params.kw = `%${keyword}%` }
    if (role)    { conds.push('role = @role');     params.role = role }
    if (status)  { conds.push('status = @status'); params.status = status }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
    const limit = Math.min(100, Math.max(1, parseInt(pageSize) || 20))
    const offset = (Math.max(1, parseInt(page) || 1) - 1) * limit

    const total = db.prepare(`SELECT COUNT(*) as c FROM users ${where}`).get(params).c
    const items = db.prepare(`
        SELECT id, username, role, status, last_login_at, created_at
        FROM users ${where}
        ORDER BY id ASC
        LIMIT ${limit} OFFSET ${offset}
    `).all(params)

    res.json({ total, page: Number(page), pageSize: limit, items })
})

// 创建
router.post('/', (req, res) => {
    const { username, password, role = 'user', status = 'active' } = req.body || {}
    if (!username || !password) return res.status(400).json({ message: '用户名和密码必填' })
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return res.status(400).json({ message: '用户名 3-20 位字母/数字/下划线' })
    if (password.length < 6 || password.length > 60) return res.status(400).json({ message: '密码 6-60 位' })
    if (!['admin', 'user'].includes(role)) return res.status(400).json({ message: '角色无效' })
    if (!['active', 'disabled'].includes(status)) return res.status(400).json({ message: '状态无效' })

    if (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) {
        return res.status(409).json({ message: '用户名已存在' })
    }
    const hash = bcrypt.hashSync(password, 10)
    const r = db.prepare('INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, ?)').run(username, hash, role, status)
    res.status(201).json({ id: r.lastInsertRowid })
})

// 更新（role/status/重置密码）
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id)
    if (!id) return res.status(400).json({ message: 'id 无效' })
    const target = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id)
    if (!target) return res.status(404).json({ message: '用户不存在' })

    // 禁止禁用/降级自己
    if (id === req.user.id && (req.body.status === 'disabled' || req.body.role === 'user')) {
        return res.status(400).json({ message: '不能对自己执行禁用或降级' })
    }

    const { role, status, password } = req.body || {}
    const sets = []
    const params = { id }
    if (role !== undefined) {
        if (!['admin', 'user'].includes(role)) return res.status(400).json({ message: '角色无效' })
        sets.push('role = @role'); params.role = role
    }
    if (status !== undefined) {
        if (!['active', 'disabled'].includes(status)) return res.status(400).json({ message: '状态无效' })
        sets.push('status = @status'); params.status = status
    }
    if (password !== undefined && password !== '') {
        if (password.length < 6 || password.length > 60) return res.status(400).json({ message: '密码 6-60 位' })
        sets.push('password_hash = @hash'); params.hash = bcrypt.hashSync(password, 10)
    }
    if (!sets.length) return res.status(400).json({ message: '无可更新字段' })

    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = @id`).run(params)
    res.json({ ok: true })
})

// 删除（禁止删自己）
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id)
    if (id === req.user.id) return res.status(400).json({ message: '不能删除自己' })
    db.prepare('DELETE FROM users WHERE id = ?').run(id)
    res.json({ ok: true })
})

// 登录日志（分页）
router.get('/logs/login', (req, res) => {
    const { page = 1, pageSize = 20 } = req.query
    const limit = Math.min(100, parseInt(pageSize) || 20)
    const offset = (Math.max(1, parseInt(page) || 1) - 1) * limit
    const total = db.prepare('SELECT COUNT(*) as c FROM login_logs').get().c
    const items = db.prepare(`
        SELECT id, user_id, username, ip, user_agent, success, reason, at
        FROM login_logs
        ORDER BY at DESC
        LIMIT ${limit} OFFSET ${offset}
    `).all()
    res.json({ total, page: Number(page), pageSize: limit, items })
})

export default router
