<template>
    <ArticleListPage title="课程鉴赏" subtitle="Course Appreciation" category="courses" :mock-data="mock" />
</template>

<script setup>
import ArticleListPage from '@/components/ArticleListPage.vue'

const mock = [
    { id: 'co1', title: '掐丝彩砂基础 · 从入门到入迷（12课时）', excerpt: '本课程由国家级传承人张老师执教，从工具认识到独立完成作品，系统学习掐丝彩砂的全流程。', date: '2026-07-15', views: 8231, tags: ['基础课','视频'], type: 'video' },
    { id: 'co2', title: '中国传统纹样设计原理（16课时）', excerpt: '梳理缠枝、云雷、几何、动植物四大纹样系统，从美学法则到当代应用。', date: '2026-07-08', views: 5624, tags: ['设计课'] },
    { id: 'co3', title: '数字化非遗保护 · 案例研讨（8课时）', excerpt: '以景泰蓝、云锦、南音三个项目为例，讲解数字化保护的方法论与工具链。', date: '2026-06-28', views: 3187, tags: ['专题'] },
    { id: 'co4', title: '苏绣入门 · 双面绣基础（10课时）', excerpt: '苏州刺绣研究所联合出品，从选料、劈丝到基础针法，一课一练。', date: '2026-06-20', views: 4521, tags: ['刺绣'], type: 'video' },
    { id: 'co5', title: '色彩心理学与传统染色（6课时）', excerpt: '结合中国传统色谱与色彩心理学，讲解染色工艺与色彩情绪表达。', date: '2026-06-12', views: 2098, tags: ['理论'] }
]
</script>
