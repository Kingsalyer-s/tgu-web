<template>
    <SiteHeader />
    <SiteNav />
    <main>
        <router-view />
    </main>
    <SiteFooter />
</template>

<script setup>
import SiteHeader from '@/components/SiteHeader.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'
</script>
