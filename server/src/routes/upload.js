import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { adminRequired } from '../auth.js'
import db from '../db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = process.env.UPLOAD_DIR
    || (process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'uploads') : path.join(__dirname, '..', 'uploads'))
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
const VIDEO_EXT = ['.mp4', '.webm', '.mov', '.m4v', '.ogv']
const AUDIO_EXT = ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
const MEDIA_EXT = [...IMAGE_EXT, ...VIDEO_EXT, ...AUDIO_EXT]

const kindOfExt = ext => IMAGE_EXT.includes(ext) ? 'image'
    : VIDEO_EXT.includes(ext) ? 'video'
    : AUDIO_EXT.includes(ext) ? 'audio'
    : 'other'

const makeStorage = () => multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || ''
        const name = crypto.randomBytes(12).toString('hex') + ext
        cb(null, name)
    }
})

const makeUploader = (allowedExts, maxBytes) => multer({
    storage: makeStorage(),
    limits: { fileSize: maxBytes },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase()
        if (!allowedExts.includes(ext)) return cb(new Error(`仅允许上传 ${allowedExts.join('/')} 类型`))
        cb(null, true)
    }
})

const imageUpload = makeUploader(IMAGE_EXT, 5 * 1024 * 1024)
const videoUpload = makeUploader(VIDEO_EXT, 200 * 1024 * 1024)
const mediaUpload = makeUploader(MEDIA_EXT, 200 * 1024 * 1024)

const router = express.Router()

const respond = (req, res) => {
    if (!req.file) return res.status(400).json({ message: '未上传文件' })
    const filename = req.file.filename
    const ext = path.extname(filename).toLowerCase()
    const url = `/uploads/${filename}`
    const kind = kindOfExt(ext)

    // 写入 media 表（不阻塞响应，失败静默）
    try {
        db.prepare(`INSERT INTO media (url, filename, original_name, mime, size, kind, uploader_id) VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .run(url, filename, req.file.originalname, req.file.mimetype, req.file.size, kind, req.user?.id || null)
    } catch (e) { /* 静默 */ }

    res.json({
        errno: 0,
        data: { url, alt: req.file.originalname, href: '' },
        url,
        originalName: req.file.originalname,
        size: req.file.size,
        kind
    })
}

router.post('/image', adminRequired, imageUpload.single('file'), respond)
router.post('/video', adminRequired, videoUpload.single('file'), respond)
router.post('/media', adminRequired, mediaUpload.single('file'), respond)

router.use((err, req, res, next) => {
    if (err) return res.status(400).json({ errno: 1, message: err.message || '上传失败' })
    next()
})

export default router
