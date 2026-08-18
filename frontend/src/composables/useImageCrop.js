/**
 * 将 File 裁剪缩放到指定分辨率（居中 cover 裁剪）
 * @param {File} file 原图片文件
 * @param {number} targetW 目标宽度（px）
 * @param {number} targetH 目标高度（px）
 * @param {number} quality JPEG 输出质量 0-1
 * @returns {Promise<File>}
 */
export function cropToFixed(file, targetW = 488, targetH = 672, quality = 0.9) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type?.startsWith('image/')) {
            return reject(new Error('不是图片文件'))
        }
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('读取文件失败'))
        reader.onload = e => {
            const img = new Image()
            img.onerror = () => reject(new Error('图片加载失败'))
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = targetW
                canvas.height = targetH
                const ctx = canvas.getContext('2d')
                ctx.fillStyle = '#000'
                ctx.fillRect(0, 0, targetW, targetH)

                // cover：等比缩放，短边贴齐，长边居中裁剪
                const ratio = Math.max(targetW / img.width, targetH / img.height)
                const w = img.width * ratio
                const h = img.height * ratio
                const dx = (targetW - w) / 2
                const dy = (targetH - h) / 2
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(img, dx, dy, w, h)

                canvas.toBlob(blob => {
                    if (!blob) return reject(new Error('图片编码失败'))
                    // 保留原文件名扩展，但统一 jpg 提升体积
                    const base = (file.name || 'image').replace(/\.[^.]+$/, '')
                    const cropped = new File([blob], `${base}_488x672.jpg`, { type: 'image/jpeg' })
                    resolve(cropped)
                }, 'image/jpeg', quality)
            }
            img.src = e.target.result
        }
        reader.readAsDataURL(file)
    })
}
