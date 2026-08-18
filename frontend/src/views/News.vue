<template>
    <ArticleListPage title="非遗资讯" subtitle="Non-heritage News & Insights" category="news" :mock-data="mock" />
</template>

<script setup>
import ArticleListPage from '@/components/ArticleListPage.vue'

const mock = [
    { id: 'n1', title: '"春节——中国人庆祝传统新年的社会实践"列入人类非遗代表作', excerpt: '2024年12月，联合国教科文组织在巴拉圭首都亚松森召开的保护非物质文化遗产政府间委员会第19届常会将……', date: '2026-07-24', views: 12568, tags: ['头条','政策'], type: 'video' },
    { id: 'n2', title: '教育部公布首批"非遗与设计"融合创新示范高校名单', excerpt: '为推进中华优秀传统文化传承发展工程在高等教育领域的落地实施……', date: '2026-07-18', views: 3821, tags: ['教育部'] },
    { id: 'n3', title: '大师课堂 | 国家级传承人张老师详解掐丝工艺的十二道工序', excerpt: '从描图到打磨，从填砂到抛光，十二道工序的每一个细节都凝聚着数十年功底……', date: '2026-07-15', views: 5320, tags: ['大师课'], type: 'video' },
    { id: 'n4', title: '2026 全国高校非遗创新设计大赛作品巡展', excerpt: '来自 128 所高校的 3600 余件学生原创作品，在全国 12 个城市开启巡展……', date: '2026-07-10', views: 2411, tags: ['赛事'], type: 'image' },
    { id: 'n5', title: '数字孪生技术在非遗保护中的应用实践——以景泰蓝制作为例', excerpt: '本研究以景泰蓝制作技艺为对象，构建了数字孪生工艺流程模型……', date: '2026-07-08', views: 1892, tags: ['学术','数字化'] },
    { id: 'n6', title: '校园工作坊 | 学生原创图案纹样设计作品集', excerpt: '本季度收录 42 位学生的原创图案设计，涵盖缠枝、云雷、几何等传统纹样的现代演绎……', date: '2026-07-05', views: 3128, tags: ['作品集'], type: 'image' }
]
</script>
