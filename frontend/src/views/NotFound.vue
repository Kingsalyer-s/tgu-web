<template>
    <section class="notfound">
        <div class="err-code">404</div>
        <div class="err-title">页面走失了</div>
        <div class="err-desc">您访问的内容可能已下架、迁移，或从未存在。</div>
        <div class="err-actions">
            <el-button size="large" @click="$router.back()">返回上页</el-button>
            <el-button size="large" type="primary" @click="$router.push('/')">回到首页</el-button>
            <el-button size="large" @click="$router.push('/projects')">浏览非遗项目</el-button>
        </div>
    </section>
</template>

<script setup>
</script>

<style scoped>
.notfound {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    text-align: center;
}
.err-code {
    font-family: var(--font-brush);
    font-size: 140px;
    color: var(--color-primary);
    line-height: 1;
    letter-spacing: 12px;
    text-shadow: 4px 4px 0 rgba(201,169,97,.3);
}
.err-title {
    font-family: var(--font-brush);
    font-size: 26px;
    color: var(--color-primary);
    letter-spacing: 6px;
    margin: 20px 0 12px;
}
.err-desc {
    color: var(--color-text-soft);
    font-size: 14px;
    margin-bottom: 30px;
}
.err-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}
</style>
