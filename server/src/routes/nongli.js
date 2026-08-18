import express from 'express'

const router = express.Router()

// 简单的 10 分钟内存缓存（顶栏日期变化慢，无需频繁上游）
let cache = { at: 0, data: null }
const TTL = 10 * 60 * 1000

router.get('/', async (req, res) => {
    try {
        const now = Date.now()
        if (cache.data && (now - cache.at) < TTL) {
            return res.json(cache.data)
        }
        const upstream = await fetch('https://api.suol.cc/v1/nongli.php', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        if (!upstream.ok) throw new Error(`upstream ${upstream.status}`)
        const data = await upstream.json()
        cache = { at: now, data }
        res.json(data)
    } catch (e) {
        console.error('[nongli] fetch error:', e.message)
        // 兜底：从服务器时间生成基础字段
        const d = new Date()
        const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][d.getDay()]
        res.json({
            code: 500,
            fallback: true,
            now_time: d.toISOString().slice(0, 16).replace('T', ' '),
            solar_year: String(d.getFullYear()),
            solar_month: String(d.getMonth() + 1).padStart(2, '0'),
            solar_day: String(d.getDate()).padStart(2, '0'),
            week_day: week,
            lunar_month: '',
            lunar_day: ''
        })
    }
})

export default router
