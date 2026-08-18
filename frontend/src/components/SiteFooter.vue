<template>
    <footer class="footer">
        <div class="footer-inner">
            <div class="footer-brand">
                <router-link to="/" class="brand">
                    <img src="/logo.jpg" alt="Logo" class="brand-logo">
                </router-link>
                <p>{{ site.description }}</p>
            </div>

            <div v-for="(col, i) in site.linkColumns" :key="i">
                <h4>{{ col.title }}</h4>
                <ul>
                    <li v-for="(link, j) in col.links" :key="j">
                        <a v-if="link.external" :href="link.url" target="_blank" rel="noopener">{{ link.name }}</a>
                        <router-link v-else-if="isInternal(link.url)" :to="link.url">{{ link.name }}</router-link>
                        <span v-else>{{ link.name }}</span>
                    </li>
                </ul>
            </div>

            <div>
                <h4>{{ site.contactTitle || '关注我们' }}</h4>
                <ul>
                    <li v-for="(c, i) in site.contactLines" :key="i">{{ c }}</li>
                </ul>
            </div>
        </div>

        <div v-if="site.friendLinks?.length" class="friend-links">
            <strong>友情链接：</strong>
            <a v-for="fl in site.friendLinks" :key="fl.url" :href="fl.url" target="_blank" rel="noopener">{{ fl.name }}</a>
        </div>

        <div class="copyright">{{ site.copyright }}</div>
    </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

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

const site = ref({ ...DEFAULT_SITE })

const isInternal = url => typeof url === 'string' && url.startsWith('/')

onMounted(async () => {
    try {
        const res = await api.get('/settings/site')
        if (res?.site) site.value = { ...DEFAULT_SITE, ...res.site }
    } catch { /* fallback 保留默认 */ }
})
</script>
