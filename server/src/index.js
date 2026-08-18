import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { ensureDefaultAdmin, seedDataIfEmpty } from './db.js'
import { requestLogger, cleanOldLogs } from './middleware/logger.js'

import authRouter from './routes/auth.js'
import articlesRouter from './routes/articles.js'
import uploadRouter from './routes/upload.js'
import settingsRouter from './routes/settings.js'
import nongliRouter from './routes/nongli.js'
import usersRouter from './routes/users.js'
import mediaRouter from './routes/media.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

const app = express()

// ============== 中间件 ==============
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true
}))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
if (NODE_ENV === 'development') app.use(morgan('dev'))
if (NODE_ENV === 'production') {
    app.use(requestLogger)
    // 每日清理旧日志（30 天以上）
    setInterval(cleanOldLogs, 24 * 60 * 60 * 1000)
    cleanOldLogs()
}

// 全局限流（防暴力）
app.use('/api/', rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
}))

// 静态：上传文件（路径与 upload.js 保持一致）
const UPLOAD_DIR = process.env.UPLOAD_DIR
    || (process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'uploads') : path.join(__dirname, 'uploads'))
app.use('/uploads', express.static(UPLOAD_DIR))

// ============== 路由 ==============
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now(), env: NODE_ENV }))
app.use('/api/auth', authRouter)
app.use('/api/articles', articlesRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/nongli', nongliRouter)
app.use('/api/users', usersRouter)
app.use('/api/media', mediaRouter)

// 404
app.use('/api', (req, res) => res.status(404).json({ message: '接口不存在' }))

// 生产模式：托管前端 dist
if (NODE_ENV === 'production') {
    const dist = path.join(__dirname, '..', '..', 'frontend', 'dist')
    app.use(express.static(dist))
    app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')))
}

// 错误兜底
app.use((err, req, res, next) => {
    console.error('[error]', err)
    res.status(err.status || 500).json({ message: err.message || '服务器内部错误' })
})

// ============== 启动 ==============
ensureDefaultAdmin()
seedDataIfEmpty()

app.listen(PORT, () => {
    console.log(`\n  🎨 非遗平台 CMS 后端启动成功`)
    console.log(`  🌏 环境：${NODE_ENV}`)
    console.log(`  🚀 http://localhost:${PORT}`)
    console.log(`  📡 API：http://localhost:${PORT}/api/health\n`)
})
