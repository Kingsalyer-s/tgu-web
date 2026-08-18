<template>
    <div class="admin-page">
        <h1 class="page-title">栏目管理</h1>
        <el-alert type="info" show-icon :closable="false" style="margin-bottom: 16px;">
            当前平台栏目结构固定为 12 项，如需增删请修改代码中的路由与栏目字典。
        </el-alert>
        <el-table :data="categories" border stripe>
            <el-table-column type="index" width="55" label="#" />
            <el-table-column prop="value" label="标识" width="140" />
            <el-table-column prop="label" label="名称" width="180" />
            <el-table-column prop="desc" label="说明" />
            <el-table-column label="内容数" width="100">
                <template #default="{ row }">{{ counts[row.value] || 0 }}</template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { articles } from '@/api'

const categories = ref([
    { value: 'news', label: '非遗资讯', desc: '行业动态、政策资讯、专题报道（支持视频/图集）' },
    { value: 'theory', label: '教育理论', desc: '非遗教育相关的理论文章与教学法研究' },
    { value: 'projects', label: '非遗项目', desc: '各级非物质文化遗产项目的详细介绍' },
    { value: 'simulation', label: '数字仿真', desc: '掐丝彩砂等交互式仿真页面（无内容管理）' },
    { value: 'cultural', label: '文创产品', desc: '非遗元素文创产品发布与作品集展示' },
    { value: 'patterns', label: '图案纹样', desc: '传统图案纹样解析与设计素材' },
    { value: 'materials', label: '材料汇总', desc: '工艺所需材料的规格、色卡、选型指南' },
    { value: 'brand', label: '品牌发布', desc: '合作品牌新品发布与合作动态' },
    { value: 'courses', label: '课程鉴赏', desc: '非遗大师课、系统课程与教学视频' },
    { value: 'academic', label: '学术专题', desc: '学术论文、专题研究、案例分析' },
    { value: 'contact', label: '联系我们', desc: '页面型内容（无内容管理）' }
])
const counts = ref({})

onMounted(async () => {
    try {
        const res = await articles.stats()
        counts.value = res.categoryCounts || {}
    } catch {}
})
</script>

<style scoped>
.page-title {
    font-family: var(--font-brush);
    font-size: 22px;
    color: var(--color-primary);
    letter-spacing: 3px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--color-primary);
}
</style>
