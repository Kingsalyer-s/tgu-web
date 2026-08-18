<template>
    <section class="page-hero">
        <h1>{{ title }}</h1>
        <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
        <div class="breadcrumb-nav">
            <router-link to="/">首页</router-link>
            <span> / </span>
            <span>{{ title }}</span>
        </div>
    </section>
</template>

<script setup>
defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' }
})
</script>
