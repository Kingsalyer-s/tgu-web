<template>
    <section class="search-panel">
        <div class="search-panel-header">
            <span class="stamp">查</span>
            <span class="search-panel-title">查询筛选</span>
        </div>

        <el-form label-width="90px" label-position="right" size="default">
            <el-form-item label="项目类别">
                <el-radio-group v-model="filters.category">
                    <el-radio-button v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="所属地区">
                <el-radio-group v-model="filters.region">
                    <el-radio-button v-for="r in REGIONS" :key="r.value" :value="r.value">{{ r.label }}</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="公共事件">
                <el-input v-model="filters.event" placeholder="请输入合作伙伴、活动或事件名称" clearable style="max-width: 480px;" />
            </el-form-item>

            <el-form-item label="项目名称">
                <el-input v-model="filters.keyword" placeholder="请输入项目名称关键词" clearable style="max-width: 480px;" @keyup.enter="onSearch" />
            </el-form-item>

            <el-form-item>
                <div style="display: flex; gap: 12px; justify-content: flex-end; width: 100%;">
                    <el-button @click="onReset">重置筛选</el-button>
                    <el-button type="primary" @click="onSearch">
                        <el-icon><Search /></el-icon>
                        <span style="margin-left: 4px;">查 询</span>
                    </el-button>
                </div>
            </el-form-item>
        </el-form>
    </section>
</template>

<script setup>
import { reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'

const emit = defineEmits(['search', 'reset'])

const CATEGORIES = [
    { value: 'all', label: '全部' },
    { value: 'minsu', label: '民俗' },
    { value: 'wenxue', label: '民间文学' },
    { value: 'yinyue', label: '传统音乐' },
    { value: 'yiyao', label: '传统医药' },
    { value: 'xiju', label: '传统戏剧' },
    { value: 'wudao', label: '传统舞蹈' },
    { value: 'tiyu', label: '传统体育' },
    { value: 'meishu', label: '传统美术' },
    { value: 'jiyi', label: '传统技艺' },
    { value: 'quyi', label: '曲艺' }
]

const REGIONS = [
    { value: 'all', label: '全部' },
    { value: 'bj', label: '北京市' },
    { value: 'tj', label: '天津市' },
    { value: 'hb', label: '河北省' },
    { value: 'sx', label: '山西省' },
    { value: 'nmg', label: '内蒙古自治区' },
    { value: 'ln', label: '辽宁省' },
    { value: 'jl', label: '吉林省' },
    { value: 'hlj', label: '黑龙江省' },
    { value: 'sh', label: '上海市' },
    { value: 'js', label: '江苏省' },
    { value: 'zj', label: '浙江省' }
]

const filters = reactive({
    category: 'all',
    region: 'all',
    event: '',
    keyword: ''
})

const onSearch = () => emit('search', { ...filters })
const onReset = () => {
    filters.category = 'all'
    filters.region = 'all'
    filters.event = ''
    filters.keyword = ''
    emit('reset')
}
</script>

<style scoped>
.search-panel {
    max-width: 1000px;
    margin: -50px auto 0;
    background: #fff;
    border-radius: 12px;
    padding: 28px 32px;
    box-shadow: var(--shadow-lg);
    position: relative;
    z-index: 5;
    border-top: 4px solid var(--color-primary);
}
.search-panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px dashed var(--color-border);
}
.stamp {
    width: 32px; height: 32px;
    background: var(--color-accent);
    color: #fff;
    display: inline-flex;
    align-items: center; justify-content: center;
    border-radius: 4px;
    font-family: var(--font-brush);
    font-size: 14px;
    font-weight: 700;
}
.search-panel-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: 2px;
}
:deep(.el-radio-button__inner) { font-size: 13px; padding: 6px 14px; }
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: var(--color-primary);
    border-color: var(--color-primary);
    box-shadow: -1px 0 0 0 var(--color-primary);
}
</style>
