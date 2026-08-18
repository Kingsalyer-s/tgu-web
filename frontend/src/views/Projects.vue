<template>
    <ArticleListPage title="非遗项目" subtitle="Intangible Cultural Heritage Projects" category="projects" :mock-data="mock" />
</template>

<script setup>
import ArticleListPage from '@/components/ArticleListPage.vue'

const mock = [
    { id: 'p1', title: '掐丝彩砂制作技艺', excerpt: '以细铜丝掐制轮廓、以彩色矿物砂粒填充，光影流转间尽显东方美学，2019年列入省级非物质文化遗产名录。', date: '2026-06-20', views: 8921, tags: ['传统技艺','数字仿真'] },
    { id: 'p2', title: '宣纸传统制作技艺', excerpt: '起源于唐代，产于安徽泾县。以青檀树皮和沙田稻草为原料，经百道工序制成"纸寿千年"的宣纸。', date: '2026-06-15', views: 6534, tags: ['造纸','人类非遗'] },
    { id: 'p3', title: '景泰蓝制作技艺', excerpt: '铜胎掐丝珐琅工艺，明代景泰年间盛行，以蓝色为主，故名"景泰蓝"。是国家级非物质文化遗产。', date: '2026-06-10', views: 5218, tags: ['金属珐琅','国家级'] },
    { id: 'p4', title: '苏绣', excerpt: '起源于苏州吴县一带，与湘绣、粤绣、蜀绣并称中国四大名绣，以"平、齐、细、密、匀、顺、和、光"闻名。', date: '2026-06-05', views: 7823, tags: ['刺绣','四大名绣'] },
    { id: 'p5', title: '龙泉青瓷烧制技艺', excerpt: '始于三国两晋，盛于宋元。哥窑、弟窑并称，釉色青翠如玉，2009年列入人类非物质文化遗产代表作名录。', date: '2026-05-28', views: 4102, tags: ['陶瓷','人类非遗'] },
    { id: 'p6', title: '南京云锦木机妆花手工织造技艺', excerpt: '始于东晋，因其绚丽多姿、灿若云霞得名。是中国传统丝绸的最高技艺代表。', date: '2026-05-22', views: 3921, tags: ['丝织','人类非遗'] },
    { id: 'p7', title: '徽墨制作技艺', excerpt: '徽州所产的墨，以松烟、桐油为主料，工艺细腻，落纸如漆，历久不褪。', date: '2026-05-15', views: 2145, tags: ['文房'] },
    { id: 'p8', title: '剪纸（陕西 · 陕北剪纸）', excerpt: '陕北剪纸粗犷有力、造型古朴，以窑洞窗花为主要载体，凝聚黄土高原的民间智慧。', date: '2026-05-10', views: 3651, tags: ['剪纸','民俗'], type: 'image' }
]
</script>
