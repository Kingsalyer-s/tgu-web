<template>
    <ArticleListPage title="图案纹样" subtitle="Traditional Patterns & Motifs" category="patterns" :mock-data="mock" />
</template>

<script setup>
import ArticleListPage from '@/components/ArticleListPage.vue'

const mock = [
    { id: 'pt1', title: '缠枝纹 · 从唐代金银器到现代设计', excerpt: '缠枝纹是中国传统装饰纹样中最常见的图案母题之一，以枝蔓卷曲连绵为基本形式。', date: '2026-07-18', views: 2210, tags: ['缠枝','纹样解析'], type: 'image' },
    { id: 'pt2', title: '云雷纹的哲学：从青铜器到当代平面设计', excerpt: '云雷纹起源于新石器时代，象征天圆地方、循环往复的宇宙观。', date: '2026-07-10', views: 1892, tags: ['云雷','商周'] },
    { id: 'pt3', title: '牡丹图案的富贵符号学', excerpt: '牡丹作为"花中之王"，在唐宋以来的装饰纹样中承载了对富贵吉祥的祈愿。', date: '2026-07-02', views: 1543, tags: ['牡丹','吉祥'] },
    { id: 'pt4', title: '海水江崖纹在皇家服饰中的等级密码', excerpt: '海水江崖纹是明清皇家龙袍的重要装饰，寓意"江山永固"、"福山寿海"。', date: '2026-06-25', views: 2078, tags: ['海水江崖','宫廷'] },
    { id: 'pt5', title: '几何冰裂纹的建筑与工艺表达', excerpt: '冰裂纹从瓷器开片到窗棂设计，从服饰到珠宝，展现中国人对"残缺美"的理解。', date: '2026-06-18', views: 1327, tags: ['几何'], type: 'image' },
    { id: 'pt6', title: '八宝纹样与佛教文化的中国化演变', excerpt: '八吉祥、暗八仙、杂宝……佛教八宝在传入中国后与本土道教、民俗融合演化。', date: '2026-06-10', views: 1109, tags: ['八宝','宗教'] }
]
</script>
