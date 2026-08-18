<template>
    <ArticleListPage title="材料汇总" subtitle="Materials Library" category="materials" :mock-data="mock" />
</template>

<script setup>
import ArticleListPage from '@/components/ArticleListPage.vue'

const mock = [
    { id: 'm1', title: '掐丝彩砂 · 天然彩砂色卡对照表', excerpt: '收录 128 种天然彩砂样本，附矿物学名称、产地、常见色号与调色配比。', date: '2026-07-15', views: 3421, tags: ['彩砂','色卡'] },
    { id: 'm2', title: '铜丝规格 · 掐丝工艺常用型号对照', excerpt: '0.3mm 至 1.5mm 铜丝各规格适用场景对照，含硬度/延展性/焊接性参数。', date: '2026-07-08', views: 2154, tags: ['铜丝','规格'] },
    { id: 'm3', title: '天然树脂胶粘剂选型指南', excerpt: '虫胶、大漆、动物胶等 12 种天然胶粘剂在不同工艺场景下的适用性对比。', date: '2026-06-30', views: 1876, tags: ['胶粘剂'] },
    { id: 'm4', title: '宣纸产地与品类速查手册', excerpt: '安徽泾县、四川夹江、云南腾冲三大宣纸产区，玉版、龙须、六吉等品类详解。', date: '2026-06-22', views: 1543, tags: ['宣纸'] },
    { id: 'm5', title: '矿物颜料 · 中国传统色谱', excerpt: '朱砂、石青、石绿、雌黄、赭石……25 种传统矿物颜料的化学成分与运用方法。', date: '2026-06-15', views: 2789, tags: ['颜料','传统色'] },
    { id: 'm6', title: '刺绣丝线材料速查表', excerpt: '苏、粤、湘、蜀四大名绣常用真丝线的股数、光泽、色号体系。', date: '2026-06-08', views: 1298, tags: ['丝线','刺绣'] }
]
</script>
