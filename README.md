# 非遗工艺数字化辅助设计与教学平台

融合非物质文化遗产传承、数字化设计与教育教学的综合平台。

- **主色**：PANTONE 512C · `#74256A` · R116 G37 B106（学校标准紫）
- **技术栈**
    - 前端：Vue 3 + Vite 5 + Element Plus 2 + Pinia + Vue Router
    - 后端：Node.js + Express + better-sqlite3 + JWT
    - 数字仿真：Canvas 2D（掐丝勾线 / 彩砂填充 / 成品预览 / 导出）

---

## 目录结构

```
her-web/
├── frontend/                Vue3 前端
│   ├── src/
│   │   ├── views/           12 个栏目页
│   │   ├── views/admin/     CMS 后台
│   │   ├── components/      共用组件
│   │   ├── layouts/         主布局 / 后台布局
│   │   ├── router/          路由（含权限守卫）
│   │   ├── stores/          Pinia
│   │   ├── api/             axios 封装
│   │   ├── composables/     可复用逻辑
│   │   └── styles/          全局样式
│   ├── public/logo.jpg
│   └── vite.config.js       含 /api 与 /uploads 代理
├── server/                  CMS 后端
│   ├── src/
│   │   ├── index.js         Express 入口
│   │   ├── db.js            SQLite + 种子数据
│   │   ├── auth.js          JWT + 权限中间件
│   │   ├── routes/          auth / articles / upload / settings
│   │   └── uploads/         用户上传目录
│   ├── data.db              运行时生成
│   └── .env.example
├── logo.jpg / origin.jpg    原始素材
└── README.md
```

---

## 一键启动

### 1. 后端 CMS（端口 3001）

```bash
cd server
cp .env.example .env       # 生产环境请修改 JWT_SECRET 与默认密码
npm install
npm run dev
```

首次启动会自动：
- 建表（users / articles / site_settings）
- 创建默认管理员 `admin / admin123`（**请立即修改**）
- 种入 19 条示例内容（分布在 9 个栏目）

### 2. 前端（端口 5173）

```bash
cd frontend
npm install
npm run dev
```

访问：
- 前台：http://localhost:5173
- 后台登录：http://localhost:5173/admin/login （admin / admin123）
- 后端健康检查：http://localhost:3001/api/health

---

## 栏目结构

| 路由 | 名称 | 说明 |
|------|------|------|
| `/` | 首页 | 展览 List（hover 展开 + 竖排字）+ 平铺筛选 + 底部三栏（非遗资讯/文创产品/学术专题） |
| `/news` | 非遗资讯 | 支持 文章 / 视频 / 图集 三种类型 |
| `/theory` | 教育理论 | 教学模式、教育理论文章 |
| `/projects` | 非遗项目 | 各级非遗项目详细介绍 |
| `/simulation` | 数字仿真 | ★ 掐丝彩砂数字化仿真（Canvas 交互） |
| `/cultural` | 文创产品 | 文创新品发布与作品集 |
| `/patterns` | 图案纹样 | 传统纹样解析与素材 |
| `/materials` | 材料汇总 | 材料/色卡/规格 |
| `/brand` | 品牌发布 | 品牌合作与新品动态 |
| `/courses` | 课程鉴赏 | 系统课程与大师课视频 |
| `/academic` | 学术专题 | 学术论文与专题研究 |
| `/contact` | 联系我们 | 平台介绍 + 留言表单 |
| `/article/:id` | 内容详情 | 通用文章详情页 |

---

## CMS 后台

登录地址：`/admin/login`

- **仪表盘** 内容统计与最近发布
- **内容管理** 全栏目内容 CRUD、多类型（文章/视频/图集）、封面上传、标签、发布/草稿
- **栏目管理** 查看栏目结构与内容数量
- **站点设置** 系统信息 + 修改密码

首页展览项由 API `/api/settings/exhibits` 提供，支持 CMS 修改（`PUT /api/settings/exhibits`）；未修改时使用默认展示。

---

## 数字仿真 · 掐丝彩砂

访问 `/simulation` 体验：

1. **① 掐丝勾线** — 选择模板（缠枝莲 / 云鹤纹 / 海浪纹 / 牡丹）或手绘，可调整线条粗细、金线颜色
2. **② 彩砂填充** — 从 12 色天然彩砂调色板中选择，点击封闭区域填充
3. **③ 成品预览** — 调节光泽度与砂粒质感，模拟烧结成品效果
4. **导出/保存** — 一键导出 PNG 或保存到本地作品集

---

## 生产部署

### 方式一：Docker Compose（推荐）

```bash
# 1. 准备环境变量
cp .env.production.example .env
# 编辑 .env：至少改 JWT_SECRET、DEFAULT_ADMIN_PASSWORD

# 2. 启动（前端 + 后端 + 备份服务）
docker compose up -d --build

# 3. 访问
# http://localhost   → 前台
# http://localhost/admin/login → 后台

# 4. 查看日志
docker compose logs -f backend
tail -f data/logs/$(date +%F).log

# 5. 手动备份
docker compose exec backup sh /backup.sh
ls backups/                        # 自动每天凌晨 3:00 备份，保留 7 天
```

**目录/卷说明**：
- `./data/` → 容器 `/data`：SQLite 库、uploads/、logs/ 都在这里，一站备份
- `./backups/` → 备份文件（gzip 压缩 SQLite 快照）

### 方式二：裸机

```bash
cd frontend && npm run build
cd ../server && cp .env.example .env  # 修改 JWT_SECRET
NODE_ENV=production node src/index.js
```
生产建议：Nginx/Caddy + HTTPS 前置；用 PM2 守护 `pm2 start src/index.js --name heritage`。

### 升级到 PostgreSQL
如需多实例部署或高并发，可将 SQLite 替换为 PostgreSQL/MySQL（改造 `server/src/db.js`）。

---

## API 概览

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/health` | 公开 | 健康检查 |
| POST | `/api/auth/login` | 公开 | 登录，返回 JWT |
| GET | `/api/auth/me` | 需登录 | 当前用户 |
| GET | `/api/articles` | 公开 | 内容列表（category/type/keyword/sortBy/page） |
| GET | `/api/articles/:id` | 公开 | 内容详情（自增浏览量） |
| POST | `/api/articles` | 需登录 | 新建 |
| PUT | `/api/articles/:id` | 需登录 | 更新 |
| DELETE | `/api/articles/:id` | 需登录 | 删除 |
| GET | `/api/articles/stats/summary` | 需登录 | 统计（仪表盘） |
| POST | `/api/upload/image` | 需登录 | 图片上传（≤5MB） |
| GET | `/api/settings/exhibits` | 公开 | 首页展览配置 |
| PUT | `/api/settings/exhibits` | 需登录 | 修改首页展览 |
| GET | `/api/settings/site` | 公开 | 站点基本信息 |
| PUT | `/api/settings/site` | 需登录 | 修改站点信息 |

---

## 安全与生产标准

- ✔️ Helmet 安全头
- ✔️ CORS 白名单
- ✔️ 全局 & 登录接口速率限制（`express-rate-limit`）
- ✔️ 密码 bcrypt 哈希
- ✔️ JWT 鉴权 + 7 天过期
- ✔️ 上传文件类型 & 大小限制
- ✔️ SQL 参数化（防注入）
- ✔️ 详情自增浏览量原子化

---

## 版权

© 2026 非遗工艺数字化辅助设计与教学平台 · 传承匠心 · 数以载道
