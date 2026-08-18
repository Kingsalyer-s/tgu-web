<template>
    <div class="admin-page">
        <h1 class="page-title">{{ isEdit ? '编辑内容' : '新建内容' }}</h1>

        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" v-loading="loading">
            <div class="edit-grid">
                <div class="edit-main">
                    <el-form-item label="标题" prop="title">
                        <el-input v-model="form.title" placeholder="请输入标题" maxlength="120" show-word-limit />
                    </el-form-item>
                    <el-form-item label="摘要" prop="excerpt">
                        <el-input v-model="form.excerpt" type="textarea" :rows="3" placeholder="用于列表展示" maxlength="300" show-word-limit />
                    </el-form-item>
                    <el-form-item label="正文" prop="content">
                        <RichEditor v-model="form.content" :min-height="520" />
                    </el-form-item>
                </div>

                <div class="edit-side">
                    <el-form-item label="栏目" prop="category">
                        <el-select v-model="form.category" style="width: 100%;">
                            <el-option v-for="c in CATEGORIES" :key="c.value" :label="c.label" :value="c.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="类型" prop="type">
                        <el-radio-group v-model="form.type">
                            <el-radio-button value="article">文章</el-radio-button>
                            <el-radio-button value="video">视频</el-radio-button>
                            <el-radio-button value="image">图集</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="标签">
                        <el-input v-model="tagInput" placeholder="多个标签用逗号分隔">
                            <template #append>
                                <el-button @click="addTags">添加</el-button>
                            </template>
                        </el-input>
                        <div style="margin-top: 8px;">
                            <el-tag v-for="t in form.tags" :key="t" closable @close="removeTag(t)" style="margin-right: 6px; margin-bottom: 6px;">
                                {{ t }}
                            </el-tag>
                        </div>
                    </el-form-item>
                    <el-form-item label="封面图">
                        <div style="display: flex; gap: 8px; align-items: flex-start;">
                            <el-upload
                                action="/api/upload/image"
                                :show-file-list="false"
                                :headers="uploadHeaders"
                                :on-success="onUploadSuccess"
                                :before-upload="beforeUpload"
                                list-type="picture-card"
                            >
                                <img v-if="form.cover" :src="form.cover" style="width:100%;height:100%;object-fit:cover;">
                                <el-icon v-else><Plus /></el-icon>
                            </el-upload>
                            <el-button size="small" @click="mediaPicker.visible = true">
                                <el-icon><Picture /></el-icon>&nbsp;从媒体库选
                            </el-button>
                        </div>
                        <el-input v-model="form.cover" size="small" placeholder="或直接粘贴图片URL" style="margin-top: 6px;" />
                    </el-form-item>
                    <el-form-item label="发布日期">
                        <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
                    </el-form-item>
                    <el-form-item label="发布状态">
                        <el-switch v-model="form.published" active-text="发布" inactive-text="草稿" />
                    </el-form-item>

                    <div class="save-btns">
                        <el-button size="large" @click="$router.push('/admin/articles')">取 消</el-button>
                        <el-button type="primary" size="large" @click="save" :loading="saving">保 存</el-button>
                    </div>
                </div>
            </div>
        </el-form>

        <!-- 从媒体库选图 -->
        <el-dialog v-model="mediaPicker.visible" title="从媒体库选择图片" width="820px" @open="loadMedia">
            <div v-loading="mediaPicker.loading" class="picker-grid">
                <div v-for="m in mediaPicker.list" :key="m.id"
                     class="picker-item"
                     :class="{ picked: form.cover === m.url }"
                     @click="pickImage(m)">
                    <img :src="m.url" :alt="m.original_name" loading="lazy">
                    <div class="picker-name" :title="m.original_name">{{ m.original_name }}</div>
                </div>
                <div v-if="!mediaPicker.list.length && !mediaPicker.loading" class="empty">
                    暂无图片，请先<router-link to="/admin/media" style="color: var(--color-primary);">上传</router-link>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { articles } from '@/api'
import api from '@/api'
import RichEditor from '@/components/RichEditor.vue'

// 媒体库选图
const mediaPicker = reactive({ visible: false, loading: false, list: [] })
const loadMedia = async () => {
    mediaPicker.loading = true
    try {
        const res = await api.get('/media', { params: { kind: 'image', pageSize: 60 } })
        mediaPicker.list = res.items || []
    } finally { mediaPicker.loading = false }
}
const pickImage = m => {
    form.cover = m.url
    mediaPicker.visible = false
    ElMessage.success('已选择')
}

const CATEGORIES = [
    { value: 'news', label: '非遗资讯' },
    { value: 'theory', label: '教育理论' },
    { value: 'projects', label: '非遗项目' },
    { value: 'cultural', label: '文创产品' },
    { value: 'patterns', label: '图案纹样' },
    { value: 'materials', label: '材料汇总' },
    { value: 'brand', label: '品牌发布' },
    { value: 'courses', label: '课程鉴赏' },
    { value: 'academic', label: '学术专题' }
]

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const tagInput = ref('')

const isEdit = computed(() => !!route.params.id)

const form = reactive({
    title: '',
    excerpt: '',
    content: '',
    category: 'news',
    type: 'article',
    tags: [],
    cover: '',
    date: new Date().toISOString().slice(0, 10),
    published: true
})

const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    category: [{ required: true, message: '请选择栏目', trigger: 'change' }],
    content: [{ required: true, message: '请输入正文', trigger: 'blur' }]
}

const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
}))

const beforeUpload = file => {
    if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片不能超过 5MB')
        return false
    }
    return true
}
const onUploadSuccess = res => {
    if (res?.url) {
        form.cover = res.url
        ElMessage.success('上传成功')
    }
}

const addTags = () => {
    if (!tagInput.value.trim()) return
    tagInput.value.split(/[,，]/).map(s => s.trim()).filter(Boolean).forEach(t => {
        if (!form.tags.includes(t)) form.tags.push(t)
    })
    tagInput.value = ''
}
const removeTag = t => { form.tags = form.tags.filter(x => x !== t) }

const load = async () => {
    if (!isEdit.value) return
    loading.value = true
    try {
        const res = await articles.get(route.params.id)
        const a = res.item || res
        Object.assign(form, a)
        if (typeof form.tags === 'string') form.tags = form.tags.split(',').filter(Boolean)
    } finally {
        loading.value = false
    }
}

const save = async () => {
    if (!formRef.value) return
    try {
        await formRef.value.validate()
        saving.value = true
        if (isEdit.value) {
            await articles.update(route.params.id, form)
        } else {
            await articles.create(form)
        }
        ElMessage.success('保存成功')
        router.push('/admin/articles')
    } finally {
        saving.value = false
    }
}

onMounted(load)
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
.edit-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 40px;
    padding-top: 8px;
    border-top: 1px solid var(--color-border);
    padding: 24px 0 0;
}
.edit-main, .edit-side {
    padding: 0;
}
.edit-side {
    padding-left: 32px;
    border-left: 1px solid var(--color-border);
}
.save-btns {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px dashed var(--color-border);
    margin-top: 16px;
}
.picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    max-height: 500px;
    overflow-y: auto;
}
.picker-item {
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color .15s;
}
.picker-item:hover { border-color: var(--color-primary-light); }
.picker-item.picked { border-color: var(--color-primary); }
.picker-item img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
    background: var(--color-bg);
}
.picker-name {
    padding: 4px 6px;
    font-size: 11px;
    color: var(--color-text-soft);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: #fff;
}
.empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: var(--color-text-mute);
}
</style>
