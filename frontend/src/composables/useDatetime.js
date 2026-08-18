import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/api'

/**
 * 从 /api/nongli（代理 api.suol.cc）拉取日期 + 农历
 * 每 30 分钟刷新一次（后端自身也有 10 分钟缓存）
 */
export function useDatetime() {
    const dateStr = ref('')
    const weekStr = ref('')
    const lunarStr = ref('')
    let timer

    const localFallback = () => {
        const d = new Date()
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        dateStr.value = `${y}-${m}-${day}`
        weekStr.value = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][d.getDay()]
        lunarStr.value = ''
    }

    const load = async () => {
        try {
            const res = await api.get('/nongli')
            if (res?.solar_year) {
                dateStr.value = `${res.solar_year}-${res.solar_month}-${res.solar_day}`
                weekStr.value = res.week_day || ''
                lunarStr.value = res.lunar_month && res.lunar_day
                    ? `农历${res.lunar_month}${res.lunar_day}`
                    : ''
            } else {
                localFallback()
            }
        } catch {
            localFallback()
        }
    }

    // 先用本地时间立即渲染，避免首屏日期空白，等接口返回后再补农历
    localFallback()

    onMounted(() => {
        load()
        timer = setInterval(load, 30 * 60 * 1000)
    })
    onUnmounted(() => clearInterval(timer))

    return { dateStr, weekStr, lunarStr }
}
