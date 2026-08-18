<template>
    <section class="section contact-section">
        <div class="contact-grid">
            <div class="contact-info">
                <h3>关于平台</h3>
                <p class="lead">
                    "非遗工艺数字化辅助设计与教学平台"是一个融合非物质文化遗产传承、数字化设计与教育教学的综合性平台。我们致力于让传统工艺在数字时代焕发新生，让每一位学习者都能便捷地接触、理解并参与非遗创作。
                </p>

                <ul class="contact-list">
                    <li>
                        <el-icon color="#74256A" :size="22"><Message /></el-icon>
                        <div>
                            <strong>电子邮箱</strong>
                            <span>contact@heritage-edu.cn</span>
                        </div>
                    </li>
                    <li>
                        <el-icon color="#74256A" :size="22"><Phone /></el-icon>
                        <div>
                            <strong>联系电话</strong>
                            <span>400-XXX-XXXX（工作日 9:00 - 17:30）</span>
                        </div>
                    </li>
                    <li>
                        <el-icon color="#74256A" :size="22"><Location /></el-icon>
                        <div>
                            <strong>通讯地址</strong>
                            <span>中国 · 高校产学研基地</span>
                        </div>
                    </li>
                    <li>
                        <el-icon color="#74256A" :size="22"><ChatDotRound /></el-icon>
                        <div>
                            <strong>合作洽谈</strong>
                            <span>partnership@heritage-edu.cn</span>
                        </div>
                    </li>
                </ul>
            </div>

            <div class="contact-form">
                <h3>留言反馈</h3>
                <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
                    <el-form-item label="您的称呼" prop="name">
                        <el-input v-model="form.name" placeholder="请输入您的姓名" />
                    </el-form-item>
                    <el-form-item label="邮箱地址" prop="email">
                        <el-input v-model="form.email" placeholder="用于我们回复您" />
                    </el-form-item>
                    <el-form-item label="留言主题" prop="subject">
                        <el-select v-model="form.subject" style="width: 100%;">
                            <el-option label="咨询建议" value="advice" />
                            <el-option label="合作洽谈" value="cooperation" />
                            <el-option label="教学合作" value="teaching" />
                            <el-option label="技术支持" value="tech" />
                            <el-option label="其他" value="other" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="留言内容" prop="content">
                        <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请详细描述您的问题或建议..." />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" size="large" @click="submit" :loading="loading" style="width: 100%;">
                            提交留言
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Message, Phone, Location, ChatDotRound } from '@element-plus/icons-vue'

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
    name: '',
    email: '',
    subject: 'advice',
    content: ''
})

const rules = {
    name: [{ required: true, message: '请输入您的称呼', trigger: 'blur' }],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ],
    content: [{ required: true, message: '请输入留言内容', trigger: 'blur' }, { min: 5, message: '至少 5 字', trigger: 'blur' }]
}

const submit = async () => {
    if (!formRef.value) return
    try {
        await formRef.value.validate()
        loading.value = true
        // TODO: 接入后端 /api/contact
        await new Promise(r => setTimeout(r, 800))
        ElMessage.success('留言已提交，我们将尽快与您联系')
        formRef.value.resetFields()
    } catch (e) {
        if (e?.message) ElMessage.error('提交失败：' + e.message)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.contact-section { max-width: 1200px; }
.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
}
.contact-info h3, .contact-form h3 {
    font-family: var(--font-brush);
    font-size: 24px;
    color: var(--color-primary);
    letter-spacing: 3px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--color-primary);
    display: inline-block;
}
.lead {
    line-height: 1.9;
    color: var(--color-text-soft);
    margin-bottom: 30px;
}
.contact-list li {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px dashed var(--color-border);
}
.contact-list li:last-child { border-bottom: none; }
.contact-list strong {
    display: block;
    color: var(--color-primary);
    font-size: 14px;
    margin-bottom: 4px;
}
.contact-list span {
    font-size: 14px;
    color: var(--color-text-soft);
}
.contact-form {
    padding: 0;
}
@media (max-width: 1024px) {
    .contact-grid { grid-template-columns: 1fr; }
}
</style>
