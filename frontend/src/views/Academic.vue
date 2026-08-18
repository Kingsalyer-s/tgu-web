<template>
    <ArticleListPage title="学术专题" subtitle="Academic Topics" category="academic" :mock-data="mock" />
</template>

<script setup>
import ArticleListPage from '@/components/ArticleListPage.vue'

const mock = [
    { id: 'ac1', title: '解锁非遗保护传承新场景', excerpt: '本文从场景理论出发，探讨在数字时代非遗保护如何构建"新场景"以承接年轻受众。', date: '2026-06-18', views: 1287, tags: ['理论'] },
    { id: 'ac2', title: '非遗保护国际合作，不止于"办一次培训"', excerpt: '案例分析中国参与联合国教科文组织非遗保护国际能力建设项目的经验与反思。', date: '2026-04-22', views: 982, tags: ['国际','政策'] },
    { id: 'ac3', title: '宁夏剪纸：从"炕头艺术"走向广阔舞台', excerpt: '以宁夏剪纸的当代传承为例，探讨民间艺术如何完成社会角色转型。', date: '2026-04-16', views: 1421, tags: ['案例'] },
    { id: 'ac4', title: '今天，我们该如何保护二十四节气', excerpt: '2016 年入选人类非遗后，二十四节气在城市化进程中面临新的传承挑战。', date: '2026-04-08', views: 2354, tags: ['专题','人类非遗'], type: 'image' },
    { id: 'ac5', title: '非遗数字化的伦理边界与知识产权', excerpt: '数字化采集、虚拟仿真、AI生成等技术带来的伦理与法律挑战。', date: '2026-03-25', views: 1876, tags: ['伦理','知识产权'] },
    { id: 'ac6', title: '构建非遗传承体验新场景——从"建设施"到"广泛惠民"', excerpt: '"十五五"规划纲要将非遗传承体验新场景纳入国家级规划的政策解读。', date: '2026-06-02', views: 2103, tags: ['政策','规划'] }
]
</script>
