<template>
    <nav class="main-nav">
        <div class="nav-inner">
            <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                custom
                v-slot="{ navigate, isActive, isExactActive }"
            >
                <a
                    class="nav-item"
                    :class="{ 'is-active': item.path === '/' ? isExactActive : isActive }"
                    @click="navigate"
                >
                    {{ item.label }}
                </a>
            </router-link>
        </div>
    </nav>
</template>

<script setup>
const navItems = [
    { path: '/', label: '首页' },
    { path: '/news', label: '非遗资讯' },
    { path: '/theory', label: '教育理论' },
    { path: '/projects', label: '非遗项目' },
    { path: '/simulation', label: '数字仿真' },
    { path: '/cultural', label: '文创产品' },
    { path: '/patterns', label: '图案纹样' },
    { path: '/materials', label: '材料汇总' },
    { path: '/brand', label: '品牌发布' },
    { path: '/courses', label: '课程鉴赏' },
    { path: '/academic', label: '学术专题' },
    { path: '/contact', label: '联系我们' }
]
</script>
