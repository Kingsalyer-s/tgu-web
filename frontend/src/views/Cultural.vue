<template>
    <ArticleListPage title="文创产品" subtitle="Cultural & Creative Products" category="cultural" :mock-data="mock" />
</template>

<script setup>
import ArticleListPage from '@/components/ArticleListPage.vue'

const mock = [
    { id: 'c1', title: '掐丝彩砂 · 敦煌飞天系列书签', excerpt: '取材敦煌壁画中的飞天纹样，以掐丝彩砂工艺再现，随书签附赠工艺卡与二维码溯源。', date: '2026-07-20', views: 3421, tags: ['文创','敦煌'] },
    { id: 'c2', title: '青花瓷元素 · 现代茶器套装', excerpt: '融合青花山水元素与现代极简造型，功能与美感兼具，适合当代生活方式。', date: '2026-07-12', views: 2810, tags: ['陶瓷','茶器'] },
    { id: 'c3', title: '苏绣 · 桌面装饰摆件系列', excerpt: '将传统苏绣双面绣工艺，转化为可置于办公桌面的迷你摆件，让传统技艺进入现代空间。', date: '2026-07-05', views: 2156, tags: ['苏绣'] },
    { id: 'c4', title: '云锦 · 手机壳设计合集', excerpt: '以南京云锦经典纹样为设计母题，采用环保 TPU 材质结合数字印刷工艺。', date: '2026-06-28', views: 4239, tags: ['云锦','数码周边'] },
    { id: 'c5', title: '剪纸 · 灯罩系列', excerpt: '陕北剪纸融合灯光设计，透光间勾勒出岁月古朴的图案，兼具装饰与照明功能。', date: '2026-06-20', views: 1874, tags: ['剪纸','家居'] },
    { id: 'c6', title: '徽墨 · 书写礼盒', excerpt: '收录五色徽墨，配以宣纸、湖笔、歙砚，为传统文房爱好者定制。', date: '2026-06-15', views: 1358, tags: ['文房'] }
]
</script>
