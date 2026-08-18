<template>
    <section class="section sim-page">
        <el-alert type="info" show-icon :closable="false" style="margin-bottom: 24px;">
            <template #title>
                <strong>使用说明：</strong>
                步骤 ①「掐丝」用铜丝勾勒图案轮廓 → 步骤 ②「填砂」选择彩砂颜色点击封闭区域填充 → 步骤 ③「预览」查看烧结后的成品效果。
            </template>
        </el-alert>

        <div class="sim-layout">
            <!-- 左侧：工具面板 -->
            <aside class="sim-tools">
                <div class="tool-card">
                    <div class="tool-title">
                        <span class="tool-step">①</span> 工艺阶段
                    </div>
                    <el-radio-group v-model="stage" size="large" style="width: 100%;">
                        <el-radio-button value="line" style="flex: 1;">掐丝勾线</el-radio-button>
                        <el-radio-button value="fill" style="flex: 1;">彩砂填充</el-radio-button>
                        <el-radio-button value="preview" style="flex: 1;">成品预览</el-radio-button>
                    </el-radio-group>
                </div>

                <!-- 掐丝：模板选择+笔刷 -->
                <div v-if="stage === 'line'" class="tool-card">
                    <div class="tool-title">
                        <span class="tool-step">②</span> 图样模板
                    </div>
                    <div class="template-grid">
                        <div
                            v-for="tpl in templates"
                            :key="tpl.key"
                            class="template-item"
                            :class="{ active: template === tpl.key }"
                            @click="loadTemplate(tpl.key)"
                        >
                            <img v-if="tpl.thumb" :src="tpl.thumb" class="template-thumb" :alt="tpl.label" />
                            <div class="template-label">{{ tpl.label }}</div>
                        </div>
                    </div>

                    <el-divider>手绘掐丝</el-divider>
                    <div class="row">
                        <el-text>线条粗细</el-text>
                        <el-slider v-model="lineWidth" :min="2" :max="10" style="flex: 1; margin-left: 12px;" />
                    </div>
                    <div class="row">
                        <el-text>金线颜色</el-text>
                        <el-color-picker v-model="lineColor" style="margin-left: 12px;" />
                    </div>
                    <div class="row">
                        <el-text>金属光泽</el-text>
                        <el-slider v-model="metallicLevel" :min="0" :max="100" style="flex: 1; margin-left: 12px;" />
                        <el-text size="small" style="width: 42px; text-align: right;">{{ metallicLevel }}</el-text>
                    </div>
                    <el-button block @click="undoLast" style="width: 100%; margin-top: 8px;">
                        <el-icon><Back /></el-icon>&nbsp;撤销上一笔
                    </el-button>
                </div>

                <!-- 填砂：彩砂画笔 -->
                <div v-if="stage === 'fill'" class="tool-card">
                    <div class="tool-title">
                        <span class="tool-step">③</span> 填砂设置
                    </div>
                    <div class="row">
                        <el-text>填砂方式</el-text>
                        <el-radio-group v-model="fillMode" size="small" style="margin-left: 12px;">
                            <el-radio-button value="brush">画笔</el-radio-button>
                            <el-radio-button value="bucket">填色器</el-radio-button>
                        </el-radio-group>
                    </div>
                    <div v-if="fillMode === 'brush'" class="row">
                        <el-text>画笔粗细</el-text>
                        <el-slider v-model="brushSize" :min="4" :max="80" style="flex: 1; margin-left: 12px;" />
                        <el-text size="small" style="width: 42px; text-align: right;">{{ brushSize }}px</el-text>
                    </div>
                    <el-text v-if="fillMode === 'bucket'" type="info" size="small" style="display: block; margin: 4px 0;">
                        点击画布上封闭金线区域内部，即可自动填满该区域彩砂
                    </el-text>
                    <div class="row">
                        <el-text>砂粒密度</el-text>
                        <el-slider v-model="sandDensity" :min="30" :max="100" style="flex: 1; margin-left: 12px;" />
                        <el-text size="small" style="width: 42px; text-align: right;">{{ sandDensity }}</el-text>
                    </div>

                    <el-divider>彩砂颜色</el-divider>
                    <div class="palette">
                        <div
                            v-for="c in palette"
                            :key="c.hex"
                            class="palette-item"
                            :class="{ active: fillColor === c.hex }"
                            :style="{ background: c.hex }"
                            :title="c.name"
                            @click="fillColor = c.hex"
                        ></div>
                    </div>
                    <div class="row">
                        <el-text>自定义</el-text>
                        <el-color-picker v-model="fillColor" style="margin-left: 12px;" />
                    </div>

                    <el-divider>一键填充预设涂色</el-divider>
                    <el-button type="primary" block @click="oneClickFill">
                        <el-icon><MagicStick /></el-icon>&nbsp;一键填充预设涂色
                    </el-button>
                    <el-button block @click="undoLast" style="width: 100%; margin-top: 8px;">
                        <el-icon><Back /></el-icon>&nbsp;撤销上一笔
                    </el-button>
                    <el-text type="info" size="small" style="display: block; margin-top: 8px;">
                        将按掐丝阶段所选模板，自动填入对应的彩砂配色成品（保留原色、轮廓为金线）
                    </el-text>

                    <el-text type="info" size="small" style="display: block; margin-top: 12px;">
                        {{ fillMode === 'bucket' ? '填色器：点击封闭金线区域内部自动填充' : '画笔：按住鼠标左键在画布上拖动，绘制彩砂' }}
                    </el-text>
                </div>

                <!-- 预览控制 -->
                <div v-if="stage === 'preview'" class="tool-card">
                    <div class="tool-title">
                        <span class="tool-step">④</span> 光影效果
                    </div>
                    <div class="row">
                        <el-text>光泽度</el-text>
                        <el-slider v-model="glossLevel" :min="0" :max="100" style="flex: 1; margin-left: 12px;" />
                    </div>
                    <div class="row">
                        <el-text>砂粒质感</el-text>
                        <el-slider v-model="sandTexture" :min="0" :max="100" style="flex: 1; margin-left: 12px;" />
                    </div>
                </div>

            </aside>

            <!-- 中央：Canvas 画布 -->
            <div class="sim-canvas-wrap">
                <div class="canvas-header">
                    <span class="canvas-title">虚拟工坊</span>
                    <span class="canvas-info">
                        当前阶段：<strong>{{ stageLabel }}</strong> · 尺寸：{{ canvasSize }}
                    </span>
                </div>
                <div class="canvas-stage" ref="stageRef">
                    <canvas
                        ref="canvasRef"
                        :width="canvasW"
                        :height="canvasH"
                        :style="{ cursor: eraserMode ? 'none' : 'crosshair' }"
                        @mousedown="onDown"
                        @mousemove="onMove"
                        @mouseup="onUp"
                        @mouseleave="onUp"
                        @mouseenter="onMouseEnter"
                    ></canvas>
                </div>
                <div class="canvas-footer">
                    <el-tag type="info" size="small">操作提示：{{ hint }}</el-tag>
                </div>
            </div>

            <!-- 右侧：橡皮擦 + 作品操作 -->
            <aside class="sim-actions">
                <!-- 橡皮擦（掐丝/填砂通用，预览模式隐藏） -->
                <div v-if="stage !== 'preview'" class="tool-card">
                    <div class="tool-title">橡皮擦</div>
                    <div class="row">
                        <el-button
                            @click="eraserMode = !eraserMode"
                            :type="eraserMode ? 'danger' : 'default'"
                            size="small"
                            style="width: 100%;"
                        >
                            <el-icon style="margin-right: 4px;"><Delete /></el-icon>
                            {{ eraserMode ? '擦除中（点击关闭）' : '开启橡皮擦' }}
                        </el-button>
                    </div>
                    <div v-if="eraserMode" class="row">
                        <el-text>擦除范围</el-text>
                        <el-slider v-model="eraserSize" :min="10" :max="100" style="flex: 1; margin-left: 12px;" />
                        <el-text size="small" style="width: 42px; text-align: right;">{{ eraserSize }}px</el-text>
                    </div>
                    <el-text v-if="eraserMode" type="danger" size="small" style="display: block; margin-top: 8px;">
                        ⚠ 按住鼠标左键拖拽擦除，松开结束
                    </el-text>
                </div>

                <div class="tool-card">
                    <div class="tool-title">作品操作</div>
                    <el-button-group style="width: 100%; display: flex;">
                        <el-button style="flex: 1;" @click="clearAll">
                            <el-icon><Delete /></el-icon>&nbsp;清空
                        </el-button>
                        <el-button style="flex: 1;" @click="exportImage">
                            <el-icon><Download /></el-icon>&nbsp;导出
                        </el-button>
                    </el-button-group>
                    <el-button type="primary" style="width: 100%; margin-top: 10px;" @click="saveWork">
                        <el-icon><Star /></el-icon>&nbsp;保存到作品集
                    </el-button>
                </div>
            </aside>
        </div>

        <!-- 底部：工艺讲解 -->
        <div class="craft-story">
            <h3 class="story-title">掐丝彩砂 · 工艺溯源</h3>
            <div class="story-grid">
                <div>
                    <h4>历史渊源</h4>
                    <p>掐丝工艺可追溯至元代，源自景泰蓝制作技艺。以细金属丝掐制出图案轮廓，再以彩色矿物填色，历经烧制方成。掐丝彩砂在传统金属珐琅工艺基础上，改良为可常温创作、便于普及教学的现代样式。</p>
                </div>
                <div>
                    <h4>工艺步骤</h4>
                    <p>① 描图 · 在胎体上勾勒图案<br>② 掐丝 · 铜丝弯折粘贴成轮廓线<br>③ 点砂 · 将彩色天然矿物砂粒填入封闭区域<br>④ 定型 · 使用天然树脂固定<br>⑤ 打磨抛光 · 呈现光泽</p>
                </div>
                <div>
                    <h4>教学价值</h4>
                    <p>本仿真系统在数字画布上还原完整工艺流程，学习者可无成本、可反复地练习图案设计与色彩搭配，理解掐丝勾线的美学法则，并将作品导出用于实体创作打样参考。</p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Back, Delete, Download, Star, MagicStick } from '@element-plus/icons-vue'

// ============== 状态 ==============
const stage = ref('line')              // 'line' | 'fill' | 'preview'
const canvasRef = ref(null)
const stageRef = ref(null)
const canvasW = ref(900)
const canvasH = ref(600)
const template = ref('')

const lineWidth = ref(4)
const lineColor = ref('#D4AF37')       // 金色
const fillColor = ref('#C0392B')       // 朱砂
const glossLevel = ref(50)
const sandTexture = ref(60)

// 彩砂画笔参数
const fillMode = ref('brush')          // 填砂方式：'brush' 画笔 | 'bucket' 填色器（封闭区域填充）
const brushSize = ref(30)              // 画笔直径 4-80px
const sandDensity = ref(70)            // 砂粒密度 30-100

// 金属光泽 + 橡皮擦
const metallicLevel = ref(70)          // 金属光泽强度 0-100
const eraserMode = ref(false)          // 橡皮擦开关
const eraserSize = ref(40)             // 橡皮擦直径 10-100px
const mousePos = ref({ x: -100, y: -100 })  // 鼠标位置（画擦除指示圈）
const lineUndoStack = ref([])          // 掐丝擦除撤销栈 [{strokes: [...]}]

const palette = [
    { name: '朱砂', hex: '#C0392B' },
    { name: '藏青', hex: '#1F3A5F' },
    { name: '石绿', hex: '#4E8867' },
    { name: '赭黄', hex: '#C9A961' },
    { name: '青莲', hex: '#74256A' },
    { name: '桃红', hex: '#E85A85' },
    { name: '雪白', hex: '#F5F1E8' },
    { name: '玄墨', hex: '#2C1810' },
    { name: '天青', hex: '#7AA9C7' },
    { name: '嫩绿', hex: '#A8C77A' },
    { name: '橙金', hex: '#E8A055' },
    { name: '紫萱', hex: '#9B4090' }
]

const templates = reactive([
    { key: 'peony', label: '牡丹', lineSrc: '/templates/line-peony.png', fillSrc: '/templates/fill-peony.png', thumb: '' },
    { key: 'lotus', label: '荷花', lineSrc: '/templates/line-lotus.png', fillSrc: '/templates/fill-lotus.png', thumb: '' },
    { key: 'landscape', label: '山水', lineSrc: '/templates/line-landscape.png', fillSrc: '/templates/fill-landscape.png', thumb: '' },
    { key: 'cat', label: '小猫', lineSrc: '/templates/line-cat.png', fillSrc: '/templates/fill-cat.png', thumb: '' }
])

// ============== 模板图像处理（线稿 → 金线 / 彩图 → 金线 + 原色 + 透明背景） ==============
const templateImage = ref(null)   // 已处理的金色线稿 canvas
const templateRect = ref(null)    // 线稿/彩图在画布上的绘制区域 {x,y,w,h}
const templateAssets = {}         // key -> { line, fill }（处理后的 canvas）

const loadImage = src => new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`模板加载失败：${src}`))
    img.src = src
})

// 线稿 → 金色勾线（透明背景，保留抗锯齿边缘）
const processLineArt = img => {
    const w = Math.min(1024, img.naturalWidth)
    const h = Math.min(1024, img.naturalHeight)
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)
    const id = ctx.getImageData(0, 0, w, h), d = id.data
    for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
        if (lum < 150) {                 // 深色线条 → 金线
            d[i] = 212; d[i + 1] = 175; d[i + 2] = 55; d[i + 3] = 255
        } else if (lum < 232) {          // 边缘过渡 → 半透明金线（抗锯齿）
            const a = Math.round((232 - lum) / (232 - 150) * 255)
            d[i] = 212; d[i + 1] = 175; d[i + 2] = 55; d[i + 3] = a
        } else {                         // 白色背景 → 透明
            d[i + 3] = 0
        }
    }
    ctx.putImageData(id, 0, 0)
    return c
}

// 金线重着色阈值：近中性(sat<45)且亮度低于该值的深色像素转为金线。
// 山水图山体为银灰/暖灰（低饱和、中等亮度），需更低阈值，避免整片山体被误染成金色。
const DEFAULT_GOLD_LUM = 125
const GOLD_LUM_OVERRIDES = { landscape: 30 }

// 彩砂成品 → 金色轮廓 + 原色填充 + 透明背景（连通域泛洪去除底色）
const processFillArt = (img, key) => {
    const w = Math.min(1024, img.naturalWidth)
    const h = Math.min(1024, img.naturalHeight)
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)
    const id = ctx.getImageData(0, 0, w, h), d = id.data
    const goldLum = GOLD_LUM_OVERRIDES[key] ?? DEFAULT_GOLD_LUM

    // 采样边缘背景色（四角 + 四边中点）
    const samples = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1], [w >> 1, 0], [w >> 1, h - 1], [0, h >> 1], [w - 1, h >> 1]]
    let br = 0, bg = 0, bb = 0
    for (const [x, y] of samples) { const i = (y * w + x) * 4; br += d[i]; bg += d[i + 1]; bb += d[i + 2] }
    br /= samples.length; bg /= samples.length; bb /= samples.length
    const tol = 55, tol2 = tol * tol

    const isBg = (x, y) => {
        const i = (y * w + x) * 4
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
        if (lum < 200) return false      // 非浅色（轮廓/深色填充）不视为底色
        const dr = d[i] - br, dg = d[i + 1] - bg, db = d[i + 2] - bb
        return dr * dr + dg * dg + db * db < tol2
    }

    // 泛洪：从四边去除连通底色
    const visited = new Uint8Array(w * h)
    const q = new Int32Array(w * h * 2)
    let qs = 0, qe = 0
    const seed = (x, y) => { if (!visited[y * w + x] && isBg(x, y)) { visited[y * w + x] = 1; q[qe++] = x; q[qe++] = y } }
    for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1) }
    for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y) }
    while (qs < qe) {
        const x = q[qs++], y = q[qs++]
        if (x > 0) seed(x - 1, y)
        if (x < w - 1) seed(x + 1, y)
        if (y > 0) seed(x, y - 1)
        if (y < h - 1) seed(x, y + 1)
    }

    // 应用：底色透明；近中性深色（黑/深棕轮廓）→ 金线；深色饱和填充（深红/深蓝/深绿）保持原色
    for (let p = 0; p < visited.length; p++) {
        const i = p * 4
        if (visited[p]) { d[i + 3] = 0; continue }
        const r = d[i], g = d[i + 1], b = d[i + 2]
        const lum = 0.299 * r + 0.587 * g + 0.114 * b
        const sat = Math.max(r, g, b) - Math.min(r, g, b)
        if (lum < goldLum && sat < 45) { d[i] = 212; d[i + 1] = 175; d[i + 2] = 55; d[i + 3] = 255 }
    }
    ctx.putImageData(id, 0, 0)
    return c
}

// ★ 模板放大比例：1.0 = 适配画布（留 5% 边距）；>1 放大（裁剪图片四周留白）；<1 缩小。
const TEMPLATE_SCALE = 1.25

// ★ 单个模板微调：scale 在 TEMPLATE_SCALE 基础上叠加；dx/dy 为相对画布尺寸的偏移比例（向左/向上为负）
const TEMPLATE_OVERRIDES = {
    lotus:     { scale: 1.0,  dx: -0.04, dy: -0.05 },   // 荷花：向左、向上一点
    landscape: { scale: 1.12, dx: 0,     dy: -0.05 }    // 山水：向上一点、放大一点
}

// 计算图案在画布中的适配区域（居中，支持单模板微调）
const fitRect = (cw, ch, iw, ih, key) => {
    const o = TEMPLATE_OVERRIDES[key] || {}
    const s = Math.min((cw * 0.9) / iw, (ch * 0.9) / ih) * TEMPLATE_SCALE * (o.scale ?? 1)
    const w = iw * s, h = ih * s
    const dx = (o.dx ?? 0) * cw
    const dy = (o.dy ?? 0) * ch
    return { x: (cw - w) / 2 + dx, y: (ch - h) / 2 + dy, w, h }
}

// 预加载并处理所有模板图片（金线缩略图 + 金色线稿 + 彩砂成品）
onMounted(async () => {
    for (const tpl of templates) {
        try {
            const [lineImg, fillImg] = await Promise.all([loadImage(tpl.lineSrc), loadImage(tpl.fillSrc)])
            const lineCanvas = processLineArt(lineImg)
            const fillCanvas = processFillArt(fillImg, tpl.key)
            templateAssets[tpl.key] = { line: lineCanvas, fill: fillCanvas }
            const tc = document.createElement('canvas')
            tc.width = 160; tc.height = 160
            tc.getContext('2d').drawImage(lineCanvas, 0, 0, 160, 160)
            tpl.thumb = tc.toDataURL('image/png')
        } catch (e) {
            console.error('模板处理失败：', tpl.key, e)
        }
    }
})

// 一键填充预设涂色：按所选模板填入对应彩砂成品
const oneClickFill = () => {
    if (!template.value) {
        ElMessage.warning('请先在「掐丝勾线」阶段选择图样模板')
        return
    }
    const asset = templateAssets[template.value]
    if (!asset || !asset.fill) {
        ElMessage.warning('模板仍在处理中，请稍候')
        return
    }
    if (!sandCtx) return
    // 保存砂层快照用于撤销
    if (sandHistory.value.length < 50) {
        sandHistory.value.push(sandCtx.getImageData(0, 0, sandCanvas.width, sandCanvas.height))
    }
    clearSandCanvas()
    const rect = templateRect.value || fitRect(canvasW.value, canvasH.value, asset.fill.width, asset.fill.height, template.value)
    sandCtx.drawImage(asset.fill, rect.x, rect.y, rect.w, rect.h)
    render()
    ElMessage.success('已一键填充预设配色')
}

// ============== 绘图数据 ==============
const strokes = ref([])          // 掐丝线条 [{type, points/svgPath, width, color}]
const sandStrokes = ref([])      // 彩砂笔触 [{id, color, brushSize, points}]
const sandHistory = ref([])      // 撤销快照栈 [ImageData]（最多50层）
const isDrawing = ref(false)
let currentStroke = null         // 当前掐丝笔触
let currentSandStroke = null     // 当前彩砂笔触
let lastSandPoint = null         // 上一彩砂采样点（用于插值）
let lastErasePoint = null        // 上一橡皮擦位置（用于插值）

// ============== 离屏砂层 Canvas ==============
let sandCanvas = null
let sandCtx = null

const initSandCanvas = () => {
    sandCanvas = document.createElement('canvas')
    sandCanvas.width = canvasW.value
    sandCanvas.height = canvasH.value
    sandCtx = sandCanvas.getContext('2d')
}

const clearSandCanvas = () => {
    if (!sandCtx) return
    sandCtx.clearRect(0, 0, sandCanvas.width, sandCanvas.height)
}

const canvasSize = computed(() => `${canvasW.value} × ${canvasH.value}`)
const stageLabel = computed(() => ({ line: '掐丝勾线', fill: '彩砂填充', preview: '成品预览' }[stage.value]))
const hint = computed(() => {
    if (eraserMode.value) return '橡皮擦模式：按住鼠标左键拖拽擦除，松开结束'
    return {
        line: '按住鼠标左键绘制掐丝线条，或点击左侧模板一键载入',
        fill: fillMode.value === 'bucket'
            ? '填色器：点击封闭金线区域内部，自动填充彩砂'
            : '画笔：选择彩砂颜色，按住鼠标左键在画布上拖动绘制彩砂',
        preview: '拖动滑块调整光泽度与砂粒质感，感受成品效果'
    }[stage.value]
})

// ============== 橡皮擦 ==============

// 判断掐丝自由线条是否被橡皮擦圆圈命中
const isFreehandTouched = (s, cx, cy, radius) => {
    const threshold = radius + s.width / 2
    // 检查每个采样点
    for (let i = 0; i < s.points.length; i++) {
        if (Math.hypot(s.points[i].x - cx, s.points[i].y - cy) < threshold) return true
    }
    // 检查线段
    for (let i = 1; i < s.points.length; i++) {
        const dist = pointToSegmentDist(cx, cy, s.points[i - 1].x, s.points[i - 1].y, s.points[i].x, s.points[i].y)
        if (dist < threshold) return true
    }
    return false
}

// 判断 SVG 路径是否被橡皮擦圆圈命中
const isSVGPathTouched = (s, cx, cy, radius) => {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvasW.value
    tempCanvas.height = canvasH.value
    const tempCtx = tempCanvas.getContext('2d')
    const p = new Path2D(s.d)
    tempCtx.lineWidth = s.width
    // 采样擦除圆周围 12 个点 + 圆心
    const samples = 13
    for (let i = 0; i < samples; i++) {
        const angle = (i / (samples - 1)) * Math.PI * 2
        const dist = i === samples - 1 ? 0 : radius * 0.7
        const sx = cx + Math.cos(angle) * dist
        const sy = cy + Math.sin(angle) * dist
        if (tempCtx.isPointInStroke(p, sx, sy)) return true
    }
    return false
}

// 掐丝擦除：删除被橡皮擦命中的线条
const eraseLinesAt = (cx, cy) => {
    const radius = eraserSize.value / 2
    if (currentStroke && currentStroke.type === 'freehand' && isFreehandTouched(currentStroke, cx, cy, radius)) {
        currentStroke = null
        isDrawing.value = false
    }
    strokes.value = strokes.value.filter(s => {
        if (s.type === 'freehand') return !isFreehandTouched(s, cx, cy, radius)
        if (s.type === 'svgpath') return !isSVGPathTouched(s, cx, cy, radius)
        return true
    })
}

// 填砂擦除：用 destination-out 清除砂粒
const eraseSandAt = (cx, cy) => {
    if (!sandCtx) return
    const radius = eraserSize.value / 2
    sandCtx.save()
    sandCtx.globalCompositeOperation = 'destination-out'
    sandCtx.fillStyle = 'rgba(0,0,0,1)'
    sandCtx.beginPath()
    sandCtx.arc(cx, cy, radius, 0, Math.PI * 2)
    sandCtx.fill()
    sandCtx.restore()
}

// 橡皮擦路径插值（避免快速拖动出现断点）
const eraseBetween = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1
    const dist = Math.sqrt(dx * dx + dy * dy)
    const step = Math.max(eraserSize.value / 4, 2)
    const steps = Math.floor(dist / step)
    if (steps <= 1) {
        stage.value === 'line' ? eraseLinesAt(x2, y2) : eraseSandAt(x2, y2)
        return
    }
    for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const px = x1 + dx * t, py = y1 + dy * t
        stage.value === 'line' ? eraseLinesAt(px, py) : eraseSandAt(px, py)
    }
}

// ============== 事件 ==============
const getPos = e => {
    const rect = canvasRef.value.getBoundingClientRect()
    const scale = canvasW.value / rect.width
    return {
        x: (e.clientX - rect.left) * scale,
        y: (e.clientY - rect.top) * scale
    }
}

// 鼠标进入画布时更新位置（确保指示圈立即可见）
const onMouseEnter = e => {
    const p = getPos(e)
    mousePos.value = p
    if (eraserMode.value) render()
}

const onDown = e => {
    const p = getPos(e)

    // 橡皮擦模式
    if (eraserMode.value) {
        isDrawing.value = true
        lastErasePoint = p
        if (stage.value === 'line') {
            // 保存 strokes 快照用于撤销
            if (lineUndoStack.value.length < 50) {
                lineUndoStack.value.push(JSON.parse(JSON.stringify(strokes.value)))
            }
            eraseLinesAt(p.x, p.y)
        } else if (stage.value === 'fill') {
            // 保存砂层快照用于撤销
            if (sandCtx && sandHistory.value.length < 50) {
                sandHistory.value.push(sandCtx.getImageData(0, 0, sandCanvas.width, sandCanvas.height))
            }
            eraseSandAt(p.x, p.y)
        }
        mousePos.value = p
        render()
        return
    }

    // 正常绘制模式
    if (stage.value === 'line') {
        isDrawing.value = true
        currentStroke = { type: 'freehand', points: [p], width: lineWidth.value, color: lineColor.value }
    } else if (stage.value === 'fill') {
        // 填色器模式：点击封闭区域自动填充
        if (fillMode.value === 'bucket') {
            bucketFill(p.x, p.y)
            return
        }
        isDrawing.value = true
        // 保存砂层快照用于撤销
        if (sandCtx && sandHistory.value.length < 50) {
            sandHistory.value.push(sandCtx.getImageData(0, 0, sandCanvas.width, sandCanvas.height))
        }
        currentSandStroke = {
            id: Date.now(),
            color: fillColor.value,
            brushSize: brushSize.value,
            points: [p]
        }
        lastSandPoint = p
        paintSandAt(p.x, p.y)
        render()
    }
}

const onMove = e => {
    const p = getPos(e)
    mousePos.value = p

    // 橡皮擦模式
    if (eraserMode.value) {
        if (isDrawing.value) {
            if (lastErasePoint) {
                eraseBetween(lastErasePoint.x, lastErasePoint.y, p.x, p.y)
            } else {
                stage.value === 'line' ? eraseLinesAt(p.x, p.y) : eraseSandAt(p.x, p.y)
            }
            lastErasePoint = p
        }
        render()  // 始终重绘以更新指示圈位置
        return
    }

    // 正常绘制模式
    if (stage.value === 'line') {
        if (!isDrawing.value || !currentStroke) return
        currentStroke.points.push(p)
        render()
    } else if (stage.value === 'fill') {
        if (!isDrawing.value || !currentSandStroke) return
        currentSandStroke.points.push(p)
        if (lastSandPoint) {
            paintSandBetween(lastSandPoint.x, lastSandPoint.y, p.x, p.y)
        } else {
            paintSandAt(p.x, p.y)
        }
        lastSandPoint = p
        render()
    }
}

const onUp = () => {
    if (eraserMode.value) {
        lastErasePoint = null
        isDrawing.value = false
        return
    }
    if (stage.value === 'line') {
        if (currentStroke && currentStroke.points.length > 1) {
            strokes.value.push(currentStroke)
        }
        currentStroke = null
    } else if (stage.value === 'fill') {
        if (currentSandStroke && currentSandStroke.points.length > 0) {
            sandStrokes.value.push(currentSandStroke)
        }
        currentSandStroke = null
        lastSandPoint = null
    }
    isDrawing.value = false
}

const undoLast = () => {
    if (stage.value === 'line') {
        if (lineUndoStack.value.length) {
            // 恢复擦除前的 strokes
            strokes.value = lineUndoStack.value.pop()
        } else if (strokes.value.length) {
            strokes.value.pop()
        }
        render()
    } else if (stage.value === 'fill' && sandHistory.value.length) {
        // 恢复上一个砂层快照
        sandStrokes.value.pop()
        const prevSnapshot = sandHistory.value.pop()
        if (sandCtx && prevSnapshot) {
            sandCtx.putImageData(prevSnapshot, 0, 0)
        }
        render()
    }
}

const loadTemplate = key => {
    const tpl = templates.find(t => t.key === key)
    if (!tpl) return
    const asset = templateAssets[key]
    if (!asset || !asset.line) {
        ElMessage.warning('模板仍在处理中，请稍候')
        return
    }
    template.value = key
    templateImage.value = asset.line
    templateRect.value = fitRect(canvasW.value, canvasH.value, asset.line.width, asset.line.height, key)
    render()
    ElMessage.success(`已载入模板：${tpl.label}`)
}

const clearAll = () => {
    ElMessageBox.confirm('确定清空当前画布？此操作不可撤销。', '提示', { type: 'warning' })
        .then(() => {
            strokes.value = []
            sandStrokes.value = []
            sandHistory.value = []
            lineUndoStack.value = []
            template.value = ''
            templateImage.value = null
            templateRect.value = null
            clearSandCanvas()
            render()
            ElMessage.success('已清空')
        }).catch(() => {})
}

const exportImage = () => {
    if (!canvasRef.value) return
    const link = document.createElement('a')
    link.download = `掐丝彩砂作品_${Date.now()}.png`
    link.href = canvasRef.value.toDataURL('image/png')
    link.click()
    ElMessage.success('已导出到本地')
}

const saveWork = async () => {
    try {
        await ElMessageBox.prompt('给你的作品起个名字', '保存作品', {
            confirmButtonText: '保存',
            cancelButtonText: '取消',
            inputPattern: /.+/,
            inputErrorMessage: '请输入作品名称',
            inputValue: `我的掐丝彩砂 - ${new Date().toLocaleString('zh-CN')}`
        }).then(({ value }) => {
            const data = {
                name: value,
                strokes: strokes.value,
                sandStrokes: sandStrokes.value,
                dataUrl: canvasRef.value.toDataURL('image/jpeg', 0.8),
                createdAt: Date.now()
            }
            const key = 'sim_works'
            const arr = JSON.parse(localStorage.getItem(key) || '[]')
            arr.unshift(data)
            localStorage.setItem(key, JSON.stringify(arr.slice(0, 30)))
            ElMessage.success('已保存到本地作品集')
        })
    } catch { /* user cancelled */ }
}

// ============== 物理级彩砂渲染 ==============

// 砂粒形状路径（椭圆 / 不规则多边形 / 粗糙圆）
const grainPath = (ctx, ox, oy, size) => {
    const r = Math.random()
    if (r < 0.5) {
        // 椭圆：模拟矿物颗粒的扁平形状
        const rx = size * 0.5
        const ry = size * (0.3 + Math.random() * 0.4)
        ctx.ellipse(ox, oy, rx, ry, 0, 0, Math.PI * 2)
    } else if (r < 0.8) {
        // 不规则圆角多边形（4-6边）
        const sides = 4 + Math.floor(Math.random() * 3)
        const pts = []
        for (let i = 0; i < sides; i++) {
            const a = (i / sides) * Math.PI * 2
            const rad = size * (0.35 + Math.random() * 0.3)
            pts.push({ x: ox + rad * Math.cos(a), y: oy + rad * Math.sin(a) })
        }
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) {
            const cpx = (pts[i - 1].x + pts[i].x) / 2, cpy = (pts[i - 1].y + pts[i].y) / 2
            ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, cpx, cpy)
        }
        ctx.quadraticCurveTo(pts[pts.length - 1].x, pts[pts.length - 1].y, pts[0].x, pts[0].y)
    } else {
        // 粗糙圆（8个扰动控制点，模拟天然砂粒磨圆度）
        const n = 8
        ctx.moveTo(ox + size * 0.45, oy)
        for (let i = 1; i < n; i++) {
            const a = (i / n) * Math.PI * 2
            const rad = size * (0.35 + Math.random() * 0.25)
            ctx.lineTo(ox + rad * Math.cos(a), oy + rad * Math.sin(a))
        }
        ctx.closePath()
    }
}

// 单颗物理砂粒：投影 + 本体 + 明暗纹理 + 晶面高光（统一左上光源）
const drawPhysicalGrain = (ctx, x, y, size, baseHSL, hVar, sVar, lVar) => {
    const h = Math.max(0, Math.min(360, baseHSL.h + hVar))
    const s = Math.max(5, Math.min(100, baseHSL.s + sVar))
    const l = Math.max(8, Math.min(92, baseHSL.l + lVar))
    const rot = Math.random() * Math.PI * 2

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)

    // 1. 柔和投影：砂粒叠压形成的立体深度（右下偏移，模拟堆叠遮挡）
    ctx.fillStyle = 'rgba(30,18,10,0.10)'
    ctx.beginPath()
    grainPath(ctx, size * 0.25, size * 0.4, size)
    ctx.fill()

    // 2. 砂粒本体（基础色）
    ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`
    ctx.beginPath()
    grainPath(ctx, 0, 0, size)
    ctx.fill()

    // 3. 边缘：矿物颗粒的粗糙轮廓（接近本色，弱化描边避免黑点）
    ctx.strokeStyle = `hsla(${h}, ${Math.max(0, s - 4)}%, ${Math.max(0, l - 4)}%, 0.06)`
    ctx.lineWidth = 0.3
    ctx.stroke()

    // 4. 恒常晶面高光：统一左上光源，模拟矿物反光面（每粒都有，更亮更密）
    ctx.fillStyle = 'rgba(255,255,255,0.30)'
    ctx.beginPath()
    ctx.ellipse(-size * 0.16, -size * 0.24, size * 0.22, size * 0.16, -0.6, 0, Math.PI * 2)
    ctx.fill()

    // 5. 右下背光暗面：增强颗粒圆润立体感（弱化，避免黑点）
    ctx.fillStyle = 'rgba(20,12,6,0.05)'
    ctx.beginPath()
    ctx.ellipse(size * 0.18, size * 0.22, size * 0.26, size * 0.18, 0.6, 0, Math.PI * 2)
    ctx.fill()

    // 6. 随机晶点闪光（小概率，模拟亮晶晶的矿砂）
    if (Math.random() < 0.16) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.beginPath()
        ctx.arc(-size * 0.1, -size * 0.28, size * 0.07, 0, Math.PI * 2)
        ctx.fill()
    }

    ctx.restore()
}

// 单颗彩砂粒子（粒度分布 + 天然色差）
const paintSingleGrain = (px, py, baseHSL) => {
    // 天然粒度分布（矿物砂粒径的幂律分布）
    const sizeRoll = Math.random()
    let grainSize
    if (sizeRoll < 0.40)       grainSize = 0.6 + Math.random() * 0.8   // 细砂 40%
    else if (sizeRoll < 0.75)  grainSize = 1.0 + Math.random() * 1.2   // 中砂 35%
    else if (sizeRoll < 0.93)  grainSize = 1.5 + Math.random() * 1.5   // 粗砂 18%
    else                        grainSize = 2.5 + Math.random() * 2.0   // 特粗 7%

    // 颜色随机变异（天然矿物色差，收窄范围让色彩更纯）
    const hVar = (Math.random() - 0.5) * 6
    const sVar = (Math.random() - 0.5) * 6
    const lVar = (Math.random() - 0.5) * 8

    drawPhysicalGrain(sandCtx, px, py, grainSize, baseHSL, hVar, sVar, lVar)
}

// 在指定位置绘制一簇彩砂粒子
const paintSandAt = (x, y) => {
    if (!sandCtx) return
    const color = fillColor.value
    const brushR = brushSize.value / 2
    const density = sandDensity.value
    const baseHSL = hexToHSL(color)

    // 粒子数 = 画笔面积 × 密度系数（除数越小，彩砂越密）
    const area = Math.PI * brushR * brushR
    const count = Math.floor(area * density / 700)

    for (let i = 0; i < count; i++) {
        // 空间分布：向中心微聚集（pow 0.6），模拟真实笔触
        const angle = Math.random() * Math.PI * 2
        const dist = brushR * Math.pow(Math.random(), 0.6)
        const px = x + Math.cos(angle) * dist
        const py = y + Math.sin(angle) * dist

        // 边界裁剪
        if (px < 0 || py < 0 || px > canvasW.value || py > canvasH.value) continue

        paintSingleGrain(px, py, baseHSL)
    }
}

// 两点之间插值采样绘制（消除画笔移动过快时产生的断点）
const paintSandBetween = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1
    const dist = Math.sqrt(dx * dx + dy * dy)
    const step = Math.max(brushSize.value / 4, 2)  // 采样间距
    const steps = Math.floor(dist / step)
    if (steps <= 1) {
        paintSandAt(x2, y2)
        return
    }
    for (let i = 0; i <= steps; i++) {
        const t = i / steps
        paintSandAt(x1 + dx * t, y1 + dy * t)
    }
}

// ============== 填色器：封闭金线区域自动填充 ==============

// 将掐丝线条作为填色边界绘制（不透明，供泛洪判断）
const drawBoundaryStroke = (ctx, s) => {
    ctx.strokeStyle = '#000'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = s.width
    if (s.type === 'freehand') {
        if (s.points.length < 2) return
        ctx.beginPath()
        ctx.moveTo(s.points[0].x, s.points[0].y)
        for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y)
        ctx.stroke()
    } else if (s.type === 'svgpath') {
        ctx.stroke(new Path2D(s.d))
    }
}

// 油漆桶式填充：点击封闭金线区域内部，自动填满该区域彩砂
const bucketFill = (cx, cy) => {
    const w = canvasW.value, h = canvasH.value
    if (!sandCtx) return
    const hasTemplate = templateImage.value && templateRect.value
    const hasStrokes = strokes.value.length > 0
    if (!hasTemplate && !hasStrokes) {
        ElMessage.warning('请先加载模板或绘制掐丝线，形成封闭区域')
        return
    }

    // 构建边界掩码（金线区域视为边界，不可越界）
    const mask = document.createElement('canvas')
    mask.width = w; mask.height = h
    const mctx = mask.getContext('2d')
    if (hasTemplate) {
        mctx.drawImage(templateImage.value, templateRect.value.x, templateRect.value.y, templateRect.value.w, templateRect.value.h)
    }
    strokes.value.forEach(s => drawBoundaryStroke(mctx, s))

    const mData = mctx.getImageData(0, 0, w, h).data
    const isBoundary = (x, y) => mData[(y * w + x) * 4 + 3] >= 128

    const sx = Math.round(cx), sy = Math.round(cy)
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) return
    if (isBoundary(sx, sy)) { ElMessage.warning('请点击封闭金线区域内部（金线上无效）'); return }

    // BFS 泛洪，收集区域内像素
    const visited = new Uint8Array(w * h)
    const regionPixels = new Int32Array(w * h)
    const q = new Int32Array(w * h * 2)
    let qs = 0, qe = 0, regionSize = 0
    const addPx = (x, y) => {
        const idx = y * w + x
        visited[idx] = 1
        regionPixels[regionSize++] = idx
        q[qe++] = x; q[qe++] = y
    }
    addPx(sx, sy)
    while (qs < qe) {
        const x = q[qs++], y = q[qs++]
        const test = (nx, ny) => {
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) return
            const idx = ny * w + nx
            if (visited[idx] || isBoundary(nx, ny)) return
            addPx(nx, ny)
        }
        test(x - 1, y); test(x + 1, y); test(x, y - 1); test(x, y + 1)
    }

    if (regionSize <= 2) { ElMessage.warning('该区域过小或未闭合'); return }

    // 保存砂层快照用于撤销
    if (sandHistory.value.length < 50) {
        sandHistory.value.push(sandCtx.getImageData(0, 0, sandCanvas.width, sandCanvas.height))
    }

    // 清空该区域原有砂粒（按区域掩码 destination-out）
    const regionMask = document.createElement('canvas')
    regionMask.width = w; regionMask.height = h
    const rctx = regionMask.getContext('2d')
    const rData = rctx.createImageData(w, h)
    for (let p = 0; p < regionSize; p++) rData.data[regionPixels[p] * 4 + 3] = 255
    rctx.putImageData(rData, 0, 0)
    sandCtx.save()
    sandCtx.globalCompositeOperation = 'destination-out'
    sandCtx.drawImage(regionMask, 0, 0)
    sandCtx.restore()

    // 密度拉满时先铺实色砂底，避免颗粒间留白
    if (sandDensity.value >= 100) {
        const [r, g, b] = hexToRGB(fillColor.value)
        for (let p = 0; p < regionSize; p++) {
            const i = regionPixels[p] * 4
            rData.data[i] = r
            rData.data[i + 1] = g
            rData.data[i + 2] = b
        }
        rctx.putImageData(rData, 0, 0)
        sandCtx.drawImage(regionMask, 0, 0)
    }

    // 以彩砂颗粒填充该区域（叠加砂粒纹理）
    const baseHSL = hexToHSL(fillColor.value)
    // 填色器比画笔更密：除数 /200（画笔为 /700），大面积时封顶避免卡顿
    const count = Math.min(200000, Math.round(regionSize * sandDensity.value / 200))
    for (let i = 0; i < count; i++) {
        const idx = regionPixels[(Math.random() * regionSize) | 0]
        const px = idx % w
        const py = (idx / w) | 0
        paintSingleGrain(px, py, baseHSL)
    }

    render()
    ElMessage.success('已填充封闭区域')
}

// ============== 渲染 ==============
const render = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height

    // 背景：胎体（深色底）
    if (stage.value === 'preview') {
        const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/1.2)
        grad.addColorStop(0, '#2C1810')
        grad.addColorStop(1, '#1a0e08')
        ctx.fillStyle = grad
    } else {
        ctx.fillStyle = '#F5F1E8'
    }
    ctx.fillRect(0, 0, w, h)

    // 网格辅助线（仅掐丝阶段）
    if (stage.value === 'line') {
        ctx.strokeStyle = 'rgba(116,37,106,.06)'
        ctx.lineWidth = 1
        const g = 40
        for (let x = 0; x < w; x += g) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
        }
        for (let y = 0; y < h; y += g) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
        }
    }

    // 彩砂层（离屏 Canvas 合成，O(1)）
    if (sandCanvas) {
        ctx.drawImage(sandCanvas, 0, 0)
    }

    // 模板金色线稿（在填砂之上、手绘掐丝之下）
    if (templateImage.value && templateRect.value) {
        ctx.drawImage(templateImage.value, templateRect.value.x, templateRect.value.y, templateRect.value.w, templateRect.value.h)
    }

    // 掐丝线（在填砂之上）
    ;[...strokes.value, currentStroke].filter(Boolean).forEach(s => drawStroke(ctx, s))

    // 成品预览：滴胶树脂光泽（高光带 + 二次柔光 + 镜面亮斑 + 表面涟漪 + 暗角 + 油润通透）
    if (stage.value === 'preview') {
        const gloss = glossLevel.value / 100
        const texture = sandTexture.value / 100

        ctx.save()

        // 1. 镜面高光主带（左上→右下，screen 叠加，模拟树脂表面的灯箱反光）
        ctx.globalCompositeOperation = 'screen'
        const band = ctx.createLinearGradient(-w * 0.25, -h * 0.25, w * 0.95, h * 0.95)
        band.addColorStop(0.00, 'rgba(255,255,255,0)')
        band.addColorStop(0.34, 'rgba(255,255,255,0)')
        band.addColorStop(0.50, `rgba(255,255,255,${0.30 * gloss})`)
        band.addColorStop(0.66, 'rgba(255,255,255,0)')
        band.addColorStop(1.00, 'rgba(255,255,255,0)')
        ctx.fillStyle = band
        ctx.fillRect(0, 0, w, h)

        // 2. 二次柔和高光（更宽、更淡，增加通透感）
        const band2 = ctx.createLinearGradient(w * 0.1, -h * 0.1, w * 0.9, h * 0.7)
        band2.addColorStop(0.00, 'rgba(255,255,255,0)')
        band2.addColorStop(0.42, `rgba(255,255,255,${0.10 * gloss})`)
        band2.addColorStop(0.58, 'rgba(255,255,255,0)')
        band2.addColorStop(1.00, 'rgba(255,255,255,0)')
        ctx.fillStyle = band2
        ctx.fillRect(0, 0, w, h)

        // 3. 镜面亮斑（左上大椭圆 + 右下小椭圆，模拟滴胶凸面反光点）
        ctx.fillStyle = `rgba(255,255,255,${0.10 * gloss})`
        ctx.beginPath()
        ctx.ellipse(w * 0.28, h * 0.26, w * 0.22, h * 0.10, -0.7, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(255,255,255,${0.06 * gloss})`
        ctx.beginPath()
        ctx.ellipse(w * 0.78, h * 0.80, w * 0.12, h * 0.06, -0.7, 0, Math.PI * 2)
        ctx.fill()

        // 4. 表面涟漪（细密斜向微光，强度随「砂粒质感」变化，模拟树脂层厚度折射）
        if (texture > 0.02) {
            ctx.globalAlpha = 0.10 * texture
            ctx.lineWidth = 1
            ctx.strokeStyle = 'rgba(255,255,255,0.5)'
            const gap = 18
            for (let t = -h; t < w + h; t += gap) {
                ctx.beginPath()
                ctx.moveTo(t, 0)
                ctx.lineTo(t - h * 0.4, h)
                ctx.stroke()
            }
            ctx.globalAlpha = 1
        }

        ctx.globalCompositeOperation = 'source-over'

        // 5. 暗角（四周轻微压暗，突出中心成品的高级感）
        const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75)
        vig.addColorStop(0, 'rgba(0,0,0,0)')
        vig.addColorStop(1, `rgba(10,5,2,${0.28 + 0.22 * gloss})`)
        ctx.fillStyle = vig
        ctx.fillRect(0, 0, w, h)

        // 6. 饱和度/对比增强（overlay 暖色，模拟树脂的油润通透感）
        ctx.globalCompositeOperation = 'overlay'
        ctx.fillStyle = `rgba(244,196,120,${0.05 + 0.08 * gloss})`
        ctx.fillRect(0, 0, w, h)

        ctx.restore()
    }

    // 橡皮擦指示圈（画在最上层，始终显示）
    if (eraserMode.value && mousePos.value.x > -50) {
        const r = eraserSize.value / 2
        ctx.save()
        // 半透明填充
        ctx.fillStyle = 'rgba(255,50,50,0.08)'
        ctx.beginPath()
        ctx.arc(mousePos.value.x, mousePos.value.y, r, 0, Math.PI * 2)
        ctx.fill()
        // 虚线描边
        ctx.setLineDash([4, 4])
        ctx.strokeStyle = 'rgba(220,40,40,0.85)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(mousePos.value.x, mousePos.value.y, r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
    }
}

const drawStroke = (ctx, s) => {
    if (!s) return
    const metallic = metallicLevel.value / 100

    if (s.type === 'freehand') {
        if (s.points.length < 2) return
        const pts = s.points

        // 绘制路径的辅助函数
        const drawPath = (offsetX, offsetY) => {
            ctx.beginPath()
            ctx.moveTo(pts[0].x + offsetX, pts[0].y + offsetY)
            for (let i = 1; i < pts.length; i++) {
                ctx.lineTo(pts[i].x + offsetX, pts[i].y + offsetY)
            }
        }

        // 第1层：深色投影（右下偏移）
        ctx.strokeStyle = 'rgba(30,15,5,0.65)'
        ctx.lineWidth = s.width + 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        drawPath(1, 1)
        ctx.stroke()

        // 第2层：暗铜底色
        ctx.strokeStyle = adjustLightness(s.color, 0.45)
        ctx.lineWidth = s.width + 1
        drawPath(0, 0)
        ctx.stroke()

        // 第3层：金属本色
        ctx.strokeStyle = s.color
        ctx.lineWidth = s.width
        drawPath(0, 0)
        ctx.stroke()

        if (metallic > 0.05) {
            // 第4层：亮金高光带（左上偏移，较窄）
            ctx.strokeStyle = adjustLightness(s.color, 1.3 + metallic * 0.5)
            ctx.lineWidth = Math.max(1, s.width * (0.35 + metallic * 0.35))
            drawPath(-0.5, -1)
            ctx.stroke()

            // 第5层：镜面反光线（更左上偏移，极细，仅中粗线可见）
            if (metallic > 0.35 && s.width >= 3) {
                ctx.strokeStyle = `rgba(255,255,255,${0.12 + metallic * 0.45})`
                ctx.lineWidth = Math.max(0.6, s.width * 0.13)
                drawPath(-0.5, -1.8)
                ctx.stroke()
            }
        }
    } else if (s.type === 'svgpath') {
        const p = new Path2D(s.d)

        // 第1层：投影
        ctx.save()
        ctx.translate(1, 1)
        ctx.strokeStyle = 'rgba(30,15,5,0.65)'
        ctx.lineWidth = s.width + 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke(p)
        ctx.restore()

        // 第2层：暗铜底色
        ctx.strokeStyle = adjustLightness(s.color, 0.45)
        ctx.lineWidth = s.width + 1
        ctx.stroke(p)

        // 第3层：金属本色
        ctx.strokeStyle = s.color
        ctx.lineWidth = s.width
        ctx.stroke(p)

        if (metallic > 0.05) {
            // 第4层：亮金高光
            ctx.save()
            ctx.translate(-0.5, -1)
            ctx.strokeStyle = adjustLightness(s.color, 1.3 + metallic * 0.5)
            ctx.lineWidth = Math.max(1, s.width * (0.35 + metallic * 0.35))
            ctx.stroke(p)
            ctx.restore()

            // 第5层：镜面反光
            if (metallic > 0.35 && s.width >= 3) {
                ctx.save()
                ctx.translate(-0.5, -1.8)
                ctx.strokeStyle = `rgba(255,255,255,${0.12 + metallic * 0.45})`
                ctx.lineWidth = Math.max(0.6, s.width * 0.13)
                ctx.stroke(p)
                ctx.restore()
            }
        }
    }
}

// ============== 颜色工具 ==============
// Hex → [r, g, b]（0-255）
const hexToRGB = hex => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
]

// Hex → HSL（用于砂粒颜色变异）
const hexToHSL = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255
    let g = parseInt(hex.slice(3, 5), 16) / 255
    let b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
            case g: h = ((b - r) / d + 2) / 6; break
            case b: h = ((r - g) / d + 4) / 6; break
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 }
}

// HSL → 亮度调节后返回 rgb 字符串（用于金属光泽层）
const adjustLightness = (hex, factor) => {
    const hsl = hexToHSL(hex)
    const l = Math.max(0, Math.min(100, hsl.l * factor))
    return `hsl(${hsl.h}, ${hsl.s}%, ${l}%)`
}

// 点到线段最短距离（用于橡皮擦碰撞检测）
const pointToSegmentDist = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1
    const lenSq = dx * dx + dy * dy
    if (lenSq === 0) return Math.hypot(px - x1, py - y1)
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
    t = Math.max(0, Math.min(1, t))
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}


// ============== 响应式尺寸 ==============
const resize = () => {
    const el = stageRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const oldW = canvasW.value, oldH = canvasH.value
    canvasW.value = Math.max(600, Math.floor(rect.width))
    canvasH.value = Math.floor(canvasW.value * 0.62)

    // 保存旧砂层 → 调整离屏 Canvas → 恢复
    let sandSnapshot = null
    if (sandCtx) {
        try { sandSnapshot = sandCtx.getImageData(0, 0, oldW, oldH) } catch (_) {}
    }
    sandCanvas.width = canvasW.value
    sandCanvas.height = canvasH.value
    sandCtx = sandCanvas.getContext('2d')
    if (sandSnapshot) {
        try { sandCtx.putImageData(sandSnapshot, 0, 0) } catch (_) {}
    }

    nextTick(render)
}

// ============== 生命周期 ==============
onMounted(() => {
    initSandCanvas()
    resize()
    window.addEventListener('resize', resize)
    render()
})
onUnmounted(() => {
    window.removeEventListener('resize', resize)
})

watch([stage, glossLevel, sandTexture, metallicLevel, eraserMode, eraserSize], render)
</script>

<style scoped>
.sim-page {
    max-width: 1400px;
    margin: 40px auto 60px;
}
.sim-layout {
    display: grid;
    grid-template-columns: 320px 1fr 220px;
    gap: 24px;
    align-items: flex-start;
}
.sim-tools {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 80px;
}
.sim-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 80px;
}
.tool-card {
    padding: 16px 0 20px;
    border-bottom: 1px solid var(--color-border);
}
.tool-card:last-child { border-bottom: none; }
.tool-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-primary);
    letter-spacing: 2px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.tool-step {
    background: var(--color-accent);
    color: #fff;
    width: 22px; height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 12px;
    font-family: var(--font-serif);
}
.row {
    display: flex;
    align-items: center;
    margin: 10px 0;
}
.template-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}
.template-item {
    aspect-ratio: 1;
    background: #F7F3EC;
    border-radius: 6px;
    padding: 8px;
    text-align: center;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all .2s;
    position: relative;
}
.template-item:hover { border-color: var(--color-primary-light); background: #fff; }
.template-item.active { border-color: var(--color-primary); background: #fff; }
.template-item svg { width: 100%; height: 70%; }
.template-thumb { width: 100%; height: 70%; object-fit: contain; }
.template-label {
    font-size: 12px;
    color: var(--color-text-soft);
    margin-top: 4px;
}
.palette {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    margin-bottom: 8px;
}
.palette-item {
    aspect-ratio: 1;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all .15s;
    box-shadow: 0 1px 3px rgba(0,0,0,.15);
}
.palette-item:hover { transform: scale(1.1); }
.palette-item.active {
    border-color: var(--color-primary);
    transform: scale(1.15);
    box-shadow: 0 3px 8px rgba(116,37,106,.4);
}

.preset-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
}
.preset-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
    border: 2px solid var(--color-border);
    background: #FBF8F1;
    transition: all .15s;
}
.preset-chip:hover { border-color: var(--color-primary-light); background: #fff; }
.preset-chip.active { border-color: var(--color-primary); background: #F8F0F8; }
.preset-dot {
    width: 18px; height: 18px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.preset-name { font-size: 12px; color: var(--color-text-soft); white-space: nowrap; }

.sim-canvas-wrap {
    padding: 0;
    border: 1px solid var(--color-border);
}
.canvas-header {
    padding: 14px 20px;
    background: var(--color-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.canvas-title {
    font-family: var(--font-brush);
    font-size: 18px;
    letter-spacing: 3px;
}
.canvas-info { font-size: 13px; opacity: .9; }
.canvas-info strong { color: var(--color-gold); }
.canvas-stage {
    position: relative;
    background: #F5F1E8;
    padding: 20px;
    min-height: 500px;
}
.canvas-stage canvas {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: inset 0 0 20px rgba(0,0,0,.1);
    cursor: crosshair;
}
.canvas-footer {
    padding: 12px 20px;
    background: #FBF8F1;
    border-top: 1px solid var(--color-border);
}

.craft-story {
    margin-top: 60px;
    padding: 40px 0;
    border-top: 1px solid var(--color-border);
    border-left: 3px solid var(--color-primary);
    padding-left: 30px;
}
.story-title {
    font-family: var(--font-brush);
    font-size: 24px;
    color: var(--color-primary);
    letter-spacing: 4px;
    margin-bottom: 24px;
}
.story-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
}
.story-grid h4 {
    font-size: 15px;
    color: var(--color-primary);
    margin-bottom: 12px;
    padding-left: 10px;
    border-left: 3px solid var(--color-accent);
}
.story-grid p {
    font-size: 13.5px;
    line-height: 1.9;
    color: var(--color-text-soft);
}

@media (max-width: 1024px) {
    .sim-layout { grid-template-columns: 1fr; }
    .sim-tools, .sim-actions { position: static; }
    .story-grid { grid-template-columns: 1fr; gap: 24px; }
}
</style>
