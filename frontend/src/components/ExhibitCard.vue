<template>
    <router-link :to="link" class="exhibit-card" :style="cardStyle">
        <div class="bg-fx"></div>
        <img v-if="image" :src="image" :alt="title">
        <div class="exhibit-overlay">
            <span class="exhibit-label" v-if="label">{{ label }}</span>
            <div class="exhibit-title">{{ title }}</div>
            <div v-if="desc" class="exhibit-desc">{{ desc }}</div>
        </div>
    </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    title: String,
    desc: String,
    label: String,
    image: String,
    link: { type: String, default: '#' },
    gradient: { type: String, default: 'linear-gradient(135deg, #74256A, #501846)' }
})

const cardStyle = computed(() => ({ background: props.gradient }))
</script>

<style scoped>
.bg-fx {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 30% 40%, rgba(201,169,97,.25) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, rgba(192,57,43,.2) 0%, transparent 50%);
    pointer-events: none;
}
</style>
