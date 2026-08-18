<template>
    <ArticleListPage title="教育理论" subtitle="Education Theory & Pedagogy" category="theory" :mock-data="mock" />
</template>

<script setup>
import ArticleListPage from '@/components/ArticleListPage.vue'

const mock = [
    { id: 't1', title: '基于建构主义的非遗工艺教学模式研究', excerpt: '本文以建构主义学习理论为指导，探讨在非遗工艺课堂中构建"情境—协作—会话—意义建构"四位一体的教学模式。', date: '2026-07-12', views: 1204, tags: ['教学模式','建构主义'] },
    { id: 't2', title: '项目式学习 (PBL) 在非遗课程中的应用路径', excerpt: '通过真实项目驱动，让学生在完成作品的过程中掌握工艺技能和文化内涵。', date: '2026-06-30', views: 890, tags: ['PBL'] },
    { id: 't3', title: '数字化教具设计原则与非遗教学的融合探索', excerpt: '本文提出适应非遗特点的数字化教具四大设计原则：真实性、可交互、可追溯、易迭代。', date: '2026-06-22', views: 1523, tags: ['数字化','教具'] },
    { id: 't4', title: '师徒制与现代教学法的对话：非遗课堂的双轨探索', excerpt: '传统师徒制与现代班级教学如何互补？本文提出"双导师+双评价"体系。', date: '2026-06-15', views: 987, tags: ['师徒制'] },
    { id: 't5', title: '非遗教育中的美育价值：一个跨学科视角', excerpt: '从美学、心理学、社会学多重视角论述非遗教育对学生审美与人格养成的独特价值。', date: '2026-06-08', views: 1156, tags: ['美育'] }
]
</script>
