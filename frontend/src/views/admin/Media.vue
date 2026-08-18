<template>
    <div class="admin-page">
        <div class="page-head">
            <h1 class="page-title">媒体库</h1>
            <el-upload :show-file-list="false"
                       :action="uploadUrl"
                       :headers="uploadHeaders"
                       :before-upload="beforeUpload"
                       :on-success="onUploaded">
                <el-button type="primary"><el-icon><Plus /></el-icon>&nbsp;上传媒体</el-button>
            </el-upload>
        </div>

        <div class="filter-bar">
            <el-radio-group v-model="query.kind" @change="reload">
                <el-radio-button value="">全部</el-radio-button>
                <el-radio-button value="image">图片</el-radio-button>
                <el-radio-button value="video">视频</el-radio-button>
                <el-radio-button value="audio">音频</el-radio-button>
            </el-radio-group>
        </div>

        <div v-loading="loading" class="media-grid">
            <div v-for="m in list" :key="m.id" class="media-item">
                <div class="media-thumb" @click="preview(m)">
                    <img v-if="m.kind === 'image'" :src="m.url" :alt="m.original_name" loading="lazy">
                    <video v-else-if="m.kind === 'video'" :src="m.url" muted></video>
                    <div v-else class="kind-icon"><el-icon :size="42"><Headset /></el-icon></div>
                    <span class="kind-tag">{{ kindLabel(m.kind) }}</span>
                </div>
                <div class="media-meta" :title="m.original_name">{{ m.original_name }}</div>
                <div class="media-actions">
                    <el-button size="small" @click="copyUrl(m.url)">复制 URL</el-button>
                    <el-button size="small" type="danger" plain @click="remove(m)">删除</el-button>
                </div>
            </div>
            <div v-if="!list.length && !loading" class="empty">暂无媒体，请先上传</div>
        </div>

        <div class="pagination">
            <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize"
                           :total="total" :page-sizes="[24, 48, 96]"
                           layout="total, sizes, prev, pager, next, jumper" background
                           @size-change="reload" @current-change="reload" />
        </div>

        <el-dialog v-model="previewDlg.visible" :title="previewDlg.item?.original_name" width="720px">
            <div style="text-align: center;">
                <img v-if="previewDlg.item?.kind === 'image'" :src="previewDlg.item.url" style="max-width: 100%;">
                <video v-else-if="previewDlg.item?.kind === 'video'" :src="previewDlg.item.url" controls style="max-width: 100%;"></video>
                <audio v-else-if="previewDlg.item?.kind === 'audio'" :src="previewDlg.item.url" controls></audio>
            </div>
            <div style="margin-top: 12px; font-size: 13px; color: #999; word-break: break-all;">
                URL：{{ previewDlg.item?.url }}
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Headset } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

const query = reactive({ kind: '', page: 1, pageSize: 24 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const previewDlg = reactive({ visible: false, item: null })

const uploadUrl = '/api/upload/media'
const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
}))

const kindLabel = k => ({ image: '图', video: '视频', audio: '音频' }[k] || '文件')

const beforeUpload = file => {
    if (file.size > 200 * 1024 * 1024) {
        ElMessage.error('文件不能超过 200MB')
        return false
    }
    return true
}
const onUploaded = res => {
    if (res?.url) {
        ElMessage.success('上传成功')
        reload()
    }
}

const reload = async () => {
    loading.value = true
    try {
        const res = await api.get('/media', { params: query })
        list.value = res.items || []
        total.value = res.total || 0
    } finally { loading.value = false }
}

const preview = m => { previewDlg.item = m; previewDlg.visible = true }

const copyUrl = url => {
    const full = location.origin + url
    navigator.clipboard?.writeText(full).then(() => ElMessage.success('URL 已复制到剪贴板'))
}

const remove = m => {
    ElMessageBox.confirm(`确认删除「${m.original_name}」？磁盘文件也将被清除`, '删除确认', { type: 'warning' })
        .then(async () => {
            await api.delete(`/media/${m.id}`)
            ElMessage.success('已删除')
            reload()
        }).catch(() => {})
}

onMounted(reload)
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title {
    font-family: var(--font-brush);
    font-size: 22px;
    color: var(--color-primary);
    letter-spacing: 3px;
}
.filter-bar { padding-bottom: 20px; border-bottom: 1px solid var(--color-border); margin-bottom: 20px; }
.media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    min-height: 200px;
}
.media-item { background: #fff; border: 1px solid var(--color-border); overflow: hidden; }
.media-thumb {
    position: relative;
    aspect-ratio: 1;
    background: var(--color-bg);
    cursor: pointer;
    overflow: hidden;
}
.media-thumb img, .media-thumb video { width: 100%; height: 100%; object-fit: cover; }
.kind-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--color-primary); }
.kind-tag {
    position: absolute; top: 6px; left: 6px;
    background: rgba(0,0,0,.6); color: #fff;
    padding: 1px 6px; font-size: 11px; border-radius: 2px;
}
.media-meta {
    padding: 8px 10px;
    font-size: 12px;
    color: var(--color-text-soft);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-top: 1px solid var(--color-border);
}
.media-actions {
    display: flex;
    gap: 4px;
    padding: 0 10px 10px;
}
.media-actions .el-button { flex: 1; padding: 4px 6px; font-size: 11px; }
.empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 20px;
    color: var(--color-text-mute);
}
.pagination { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>
