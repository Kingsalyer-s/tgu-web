<template>
    <div class="rich-editor-wrap">
        <Toolbar
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            mode="default"
            class="editor-toolbar"
        />
        <Editor
            v-model="valueRef"
            :defaultConfig="editorConfig"
            :mode="'default'"
            class="editor-body"
            @onCreated="handleCreated"
            @onChange="handleChange"
        />
    </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, ref, shallowRef, watch, computed } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const props = defineProps({
    modelValue: { type: String, default: '' },
    minHeight: { type: Number, default: 500 }
})
const emit = defineEmits(['update:modelValue'])

const editorRef = shallowRef()
const valueRef = ref(props.modelValue || '')

watch(() => props.modelValue, v => { if (v !== valueRef.value) valueRef.value = v || '' })

const handleCreated = editor => { editorRef.value = editor }
const handleChange = editor => { emit('update:modelValue', editor.getHtml()) }

onBeforeUnmount(() => { editorRef.value?.destroy() })

const authHeader = computed(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
}))

// 工具栏配置
const toolbarConfig = {
    excludeKeys: ['group-video', 'insertVideo'] // 用 uploadVideo 替代
}

// 编辑器配置
const editorConfig = {
    placeholder: '请输入正文内容，工具栏支持文本样式、图片、视频、表格、代码等...',
    MENU_CONF: {
        uploadImage: {
            server: '/api/upload/image',
            fieldName: 'file',
            maxFileSize: 5 * 1024 * 1024,
            allowedFileTypes: ['image/*'],
            headers: authHeader.value,
            customInsert(res, insertFn) {
                if (res?.url) insertFn(res.url, res.originalName || '', '')
                else insertFn(res?.data?.url, '', '')
            },
            onError(file, err, res) {
                console.error('图片上传失败', err, res)
            }
        },
        uploadVideo: {
            server: '/api/upload/video',
            fieldName: 'file',
            maxFileSize: 200 * 1024 * 1024,
            allowedFileTypes: ['video/*'],
            headers: authHeader.value,
            customInsert(res, insertFn) {
                const url = res?.url || res?.data?.url
                if (url) insertFn(url, '')
            },
            onError(file, err, res) {
                console.error('视频上传失败', err, res)
            }
        }
    }
}
</script>

<style scoped>
.rich-editor-wrap {
    border: 1px solid var(--color-border);
    background: #fff;
}
.editor-toolbar {
    border-bottom: 1px solid var(--color-border);
    background: #fbf8f1;
}
.editor-body {
    min-height: v-bind('props.minHeight + "px"');
    overflow-y: auto;
}
:deep(.w-e-text-container) {
    background: #fff !important;
}
:deep(.w-e-text-container [data-slate-editor]) {
    min-height: v-bind('(props.minHeight - 60) + "px"');
    padding: 16px 20px;
    line-height: 1.9;
    font-size: 15px;
    color: var(--color-text);
}
:deep(.w-e-bar-item button) {
    color: var(--color-text);
}
:deep(.w-e-bar-item .active) {
    color: var(--color-primary) !important;
    background: rgba(116,37,106,.08) !important;
}
</style>
