import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import morgan from 'morgan'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG_DIR = process.env.LOG_DIR
    || (process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'logs') : path.join(__dirname, '..', '..', 'logs'))

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })

// 按日期滚动的写入流缓存
const streams = new Map()
const streamForToday = () => {
    const day = new Date().toISOString().slice(0, 10)
    const filePath = path.join(LOG_DIR, `${day}.log`)
    if (streams.has(day)) return streams.get(day)
    // 清理旧 stream（保留最近 3 天缓存）
    if (streams.size > 3) {
        const oldest = streams.keys().next().value
        try { streams.get(oldest)?.end() } catch {}
        streams.delete(oldest)
    }
    const s = fs.createWriteStream(filePath, { flags: 'a' })
    streams.set(day, s)
    return s
}

export const requestLogger = morgan('combined', {
    stream: {
        write: msg => streamForToday().write(msg)
    }
})

// 简单删除超过 30 天的日志
export const cleanOldLogs = () => {
    try {
        const files = fs.readdirSync(LOG_DIR)
        const now = Date.now()
        const KEEP_DAYS = 30
        files.forEach(f => {
            if (!f.endsWith('.log')) return
            const p = path.join(LOG_DIR, f)
            const stat = fs.statSync(p)
            if (now - stat.mtimeMs > KEEP_DAYS * 86400_000) fs.unlinkSync(p)
        })
    } catch {}
}
