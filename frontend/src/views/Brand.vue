<template>
    <ArticleListPage title="品牌发布" subtitle="Brand Launches" category="brand" :mock-data="mock" />
</template>

<script setup>
import ArticleListPage from '@/components/ArticleListPage.vue'

const mock = [
    { id: 'b1', title: '"承·匠"品牌新一季设计发布', excerpt: '本季以"数字之光·古法之温"为主题，共发布 32 款融合掐丝彩砂工艺的原创设计。', date: '2026-07-20', views: 5421, tags: ['首发'], type: 'image' },
    { id: 'b2', title: '"藕丝"苏绣品牌获红点设计奖', excerpt: '藕丝品牌本年度参赛作品《山水四联屏》斩获国际红点设计概念大奖。', date: '2026-07-12', views: 3298, tags: ['获奖'] },
    { id: 'b3', title: '"泥语"陶艺入驻798艺术区', excerpt: '青年陶艺品牌"泥语"完成 A 轮融资，新旗舰店 8 月于北京 798 开业。', date: '2026-07-05', views: 2154, tags: ['商业'] },
    { id: 'b4', title: '非遗品牌合作 · 高校×企业联合发布', excerpt: '本平台联合 12 所高校与 30 家非遗品牌，签署联合培养与产品共创协议。', date: '2026-06-28', views: 1876, tags: ['合作'] },
    { id: 'b5', title: '"云上织造"数字化云锦品牌启动', excerpt: '"云上织造"运用 3D 建模+AI 生成技术，将传统云锦纹样引入数字消费品设计。', date: '2026-06-20', views: 2432, tags: ['数字化'] }
]
</script>
