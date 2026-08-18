import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const signToken = payload => jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })

export const verifyToken = token => {
    try { return jwt.verify(token, SECRET) } catch { return null }
}

export const authRequired = (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ message: '未登录' })
    const payload = verifyToken(token)
    if (!payload) return res.status(401).json({ message: '登录已过期' })
    req.user = payload
    next()
}

// 角色鉴权：必须已登录且角色符合
export const requireRole = (...allowed) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: '未登录' })
    if (!allowed.includes(req.user.role)) {
        return res.status(403).json({ message: '权限不足' })
    }
    next()
}

// 便捷：管理员专用
export const adminRequired = [authRequired, requireRole('admin')]
