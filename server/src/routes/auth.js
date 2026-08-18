import express from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import db from '../db.js'
import { signToken, authRequired } from '../auth.js'

const router = express.Router()

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: '登录尝试过于频繁，请稍后再试' }
})

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: '注册尝试过于频繁，请稍后再试' }
})

const clientIp = req => (req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '').slice(0, 45)
const clientUa = req => (req.headers['user-agent'] || '').slice(0, 200)

const logLogin = (userId, username, req, success, reason = null) => {
    try {
        db.prepare(`INSERT INTO login_logs (user_id, username, ip, user_agent, success, reason) VALUES (?, ?, ?, ?, ?, ?)`)
            .run(userId, username, clientIp(req), clientUa(req), success ? 1 : 0, reason)
    } catch (e) { /* 静默 */ }
}

router.post('/login', loginLimiter, (req, res) => {
    const { username, password } = req.body || {}
    if (!username || !password) {
        logLogin(null, username || '', req, false, '空字段')
        return res.status(400).json({ message: '用户名和密码不能为空' })
    }

    const user = db.prepare('SELECT id, username, password_hash, role, status FROM users WHERE username = ?').get(username)
    if (!user) {
        logLogin(null, username, req, false, '用户不存在')
        return res.status(401).json({ message: '用户名或密码错误' })
    }

    if (user.status === 'disabled') {
        logLogin(user.id, username, req, false, '账户已禁用')
        return res.status(403).json({ message: '账户已被禁用，请联系管理员' })
    }

    const ok = bcrypt.compareSync(password, user.password_hash)
    if (!ok) {
        logLogin(user.id, username, req, false, '密码错误')
        return res.status(401).json({ message: '用户名或密码错误' })
    }

    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id)
    logLogin(user.id, username, req, true)

    const token = signToken({ id: user.id, username: user.username, role: user.role })
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
})

router.post('/register', registerLimiter, (req, res) => {
    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ message: '用户名和密码不能为空' })
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({ message: '用户名 3-20 位字母/数字/下划线' })
    }
    if (password.length < 6 || password.length > 60) {
        return res.status(400).json({ message: '密码 6-60 位' })
    }
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (existing) {
        logLogin(null, username, req, false, '注册失败-用户名已存在')
        return res.status(409).json({ message: '用户名已存在' })
    }

    const hash = bcrypt.hashSync(password, 10)
    const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, 'user')
    const id = result.lastInsertRowid
    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(id)
    logLogin(id, username, req, true, '注册')
    const token = signToken({ id, username, role: 'user' })
    res.status(201).json({ token, user: { id, username, role: 'user' } })
})

router.get('/me', authRequired, (req, res) => {
    const row = db.prepare('SELECT id, username, role, status, last_login_at FROM users WHERE id = ?').get(req.user.id)
    if (!row) return res.status(401).json({ message: '用户不存在' })
    if (row.status === 'disabled') return res.status(403).json({ message: '账户已禁用' })
    res.json({ user: row })
})

// 修改自己的密码
router.post('/change-password', authRequired, (req, res) => {
    const { oldPassword, newPassword } = req.body || {}
    if (!oldPassword || !newPassword) return res.status(400).json({ message: '请填写完整' })
    if (newPassword.length < 6 || newPassword.length > 60) {
        return res.status(400).json({ message: '新密码 6-60 位' })
    }
    if (oldPassword === newPassword) return res.status(400).json({ message: '新密码与原密码相同' })

    const user = db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(req.user.id)
    if (!user) return res.status(404).json({ message: '用户不存在' })
    if (!bcrypt.compareSync(oldPassword, user.password_hash)) {
        return res.status(401).json({ message: '原密码错误' })
    }
    const hash = bcrypt.hashSync(newPassword, 10)
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id)
    res.json({ ok: true })
})

export default router
