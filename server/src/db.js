import Database from 'better-sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..')
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'data.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ============== 建表 ==============
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    status TEXT NOT NULL DEFAULT 'active',
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'article',
    title TEXT NOT NULL,
    excerpt TEXT DEFAULT '',
    content TEXT DEFAULT '',
    cover TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    date TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    filename TEXT,
    original_name TEXT,
    mime TEXT,
    size INTEGER,
    kind TEXT,
    uploader_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    ip TEXT,
    user_agent TEXT,
    success INTEGER NOT NULL,
    reason TEXT,
    at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date DESC);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_logs_at ON login_logs(at DESC);
`)

// ============== 迁移：给旧 users 表补字段（幂等） ==============
const userCols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name)
if (!userCols.includes('status')) {
    db.exec(`ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`)
}
if (!userCols.includes('last_login_at')) {
    db.exec(`ALTER TABLE users ADD COLUMN last_login_at DATETIME`)
}

// ============== 初始管理员 ==============
export function ensureDefaultAdmin() {
    const user = process.env.DEFAULT_ADMIN_USERNAME || 'admin'
    const pass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(user)
    if (!exists) {
        const hash = bcrypt.hashSync(pass, 10)
        db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(user, hash, 'admin')
        console.log(`[db] created default admin: ${user} / ${pass} (请立即修改)`)
    }
}

// ============== 种子数据 ==============
export function seedDataIfEmpty() {
    const count = db.prepare('SELECT COUNT(*) as c FROM articles').get().c
    if (count > 0) return

    console.log('[db] seeding sample articles...')
    const insert = db.prepare(`
        INSERT INTO articles (category, type, title, excerpt, content, tags, date, views, published)
        VALUES (@category, @type, @title, @excerpt, @content, @tags, @date, @views, 1)
    `)
    const many = db.transaction(rows => rows.forEach(r => insert.run(r)))
    many(SEED)
    console.log(`[db] seeded ${SEED.length} articles`)
}

const SEED = [
    // news
    { category: 'news', type: 'video', title: '"春节——中国人庆祝传统新年的社会实践"列入人类非遗代表作',
      excerpt: '联合国教科文组织在保护非物质文化遗产政府间委员会第19届常会将春节列入代表作名录。',
      content: '2024年12月，联合国教科文组织在巴拉圭首都亚松森召开的保护非物质文化遗产政府间委员会第19届常会，将"春节——中国人庆祝传统新年的社会实践"列入人类非物质文化遗产代表作名录。\n\n这是我国第44个入选联合国教科文组织非物质文化遗产名录（名册）的项目。至此，我国以44个项目位居世界第一。\n\n春节是中华民族最重要的传统节日……',
      tags: '头条,政策', date: '2026-07-24', views: 12568 },
    { category: 'news', type: 'article', title: '教育部公布首批"非遗与设计"融合创新示范高校名单',
      excerpt: '教育部办公厅日前公布首批"非遗与设计"融合创新示范高校名单，共 32 所高校入选。',
      content: '本次评选历时半年，从全国 200 余所申报高校中优选而出。示范高校将获得专项经费支持，用于建设非遗数字化教学实验室、开发跨学科课程体系、组织学生创新创业项目。',
      tags: '教育部', date: '2026-07-18', views: 3821 },
    { category: 'news', type: 'video', title: '大师课堂 | 国家级传承人张老师详解掐丝工艺的十二道工序',
      excerpt: '从描图到打磨，从填砂到抛光，十二道工序的每一个细节都凝聚着数十年功底。',
      content: '本期大师课邀请国家级掐丝彩砂技艺代表性传承人张老师，全程演示从选材到成品的完整制作过程。视频时长 45 分钟，配有多机位特写与工艺解说……',
      tags: '大师课', date: '2026-07-15', views: 5320 },
    { category: 'news', type: 'image', title: '2026 全国高校非遗创新设计大赛作品巡展',
      excerpt: '来自 128 所高校的 3600 余件学生原创作品，在全国 12 个城市开启巡展。',
      content: '本届大赛以"数字之光·古法之温"为主题，共收到有效投稿 3624 件……',
      tags: '赛事', date: '2026-07-10', views: 2411 },
    { category: 'news', type: 'article', title: '数字孪生技术在非遗保护中的应用实践——以景泰蓝制作为例',
      excerpt: '构建了完整的数字孪生工艺流程模型，为传承提供了新的数字化路径。',
      content: '本研究以景泰蓝制作技艺为研究对象，运用数字孪生技术，构建了从制胎、掐丝、点蓝、烧制、磨光到镀金的完整数字化工艺流程模型……',
      tags: '学术,数字化', date: '2026-07-08', views: 1892 },
    // theory
    { category: 'theory', type: 'article', title: '基于建构主义的非遗工艺教学模式研究',
      excerpt: '以建构主义学习理论为指导，探讨"情境—协作—会话—意义建构"四位一体教学模式。',
      content: '本文以建构主义学习理论为指导，探讨在非遗工艺课堂中构建"情境—协作—会话—意义建构"四位一体的教学模式。\n\n通过在 5 所试点高校的实证研究，验证了该模式在学生技能掌握、文化理解、创新能力三个维度的显著提升效果。',
      tags: '教学模式,建构主义', date: '2026-07-12', views: 1204 },
    { category: 'theory', type: 'article', title: '项目式学习 (PBL) 在非遗课程中的应用路径',
      excerpt: '通过真实项目驱动，让学生在完成作品的过程中掌握工艺技能和文化内涵。',
      content: 'PBL 在非遗教育中的应用需要三个前提：真实的工艺场景、可交付的作品产出、可评价的学习成果……',
      tags: 'PBL', date: '2026-06-30', views: 890 },
    // projects
    { category: 'projects', type: 'article', title: '掐丝彩砂制作技艺',
      excerpt: '以细铜丝掐制轮廓、以彩色矿物砂粒填充，光影流转间尽显东方美学。',
      content: '掐丝彩砂制作技艺起源于元代金属珐琅工艺，经过历代传承创新，形成了独具特色的当代样式。本项目 2019 年列入省级非物质文化遗产名录……',
      tags: '传统技艺,数字仿真', date: '2026-06-20', views: 8921 },
    { category: 'projects', type: 'article', title: '宣纸传统制作技艺',
      excerpt: '起源于唐代，产于安徽泾县，以青檀树皮和沙田稻草为原料。',
      content: '宣纸是中国传统的书画用纸，产于安徽泾县。以青檀树皮和沙田稻草为主要原料，经浸泡、蒸煮、洗净、漂白、打浆、抄纸、干燥等百余道工序制成……',
      tags: '造纸,人类非遗', date: '2026-06-15', views: 6534 },
    // cultural
    { category: 'cultural', type: 'article', title: '构建非遗传承体验新场景——从"建设施"到"广泛惠民"',
      excerpt: '"十五五"规划纲要明确提出"提升非物质文化遗产保护传承水平"。',
      content: '"十五五"规划纲要明确提出"提升非物质文化遗产保护传承水平，培育传承体验新场景"，首次将非遗传承体验新场景纳入国家级规划……',
      tags: '政策', date: '2026-06-02', views: 3421 },
    { category: 'cultural', type: 'article', title: '掐丝彩砂 · 敦煌飞天系列书签',
      excerpt: '取材敦煌壁画中的飞天纹样，以掐丝彩砂工艺再现。',
      content: '本系列共 12 款，取材于莫高窟第 320、112、257 等窟的经典飞天造型……', tags: '文创,敦煌', date: '2026-07-20', views: 2810 },
    // academic
    { category: 'academic', type: 'article', title: '解锁非遗保护传承新场景',
      excerpt: '从场景理论出发，探讨数字时代非遗保护如何构建"新场景"。',
      content: '本文从场景理论出发，梳理数字化技术为非遗保护带来的"新场景"及其意义……', tags: '理论', date: '2026-06-18', views: 1287 },
    { category: 'academic', type: 'article', title: '非遗保护国际合作，不止于"办一次培训"',
      excerpt: '案例分析中国参与联合国教科文组织非遗保护国际能力建设项目的经验与反思。',
      content: '过去十年间，中国主办非遗保护国际培训班 45 期，累计培训来自 138 个国家的学员 3200 余人次……', tags: '国际,政策', date: '2026-04-22', views: 982 },
    { category: 'academic', type: 'article', title: '宁夏剪纸：从"炕头艺术"走向广阔舞台',
      excerpt: '以宁夏剪纸的当代传承为例，探讨民间艺术如何完成社会角色转型。',
      content: '宁夏剪纸源于回汉民众生活，以粗犷奔放、意象独特著称……', tags: '案例', date: '2026-04-16', views: 1421 },
    { category: 'academic', type: 'image', title: '今天，我们该如何保护二十四节气',
      excerpt: '2016 年入选人类非遗后，二十四节气在城市化进程中面临新的传承挑战。',
      content: '二十四节气作为中华农耕文明的智慧结晶，如何在城市化和气候变化背景下延续其文化生命力，需要跨学科的思考……', tags: '专题,人类非遗', date: '2026-04-08', views: 2354 },
    // patterns
    { category: 'patterns', type: 'image', title: '缠枝纹 · 从唐代金银器到现代设计',
      excerpt: '缠枝纹是中国传统装饰纹样中最常见的图案母题之一。',
      content: '缠枝纹以枝蔓卷曲连绵为基本形式，多与花卉、瓜果、鸟兽结合，寓意"连绵不断、生生不息"……', tags: '缠枝,纹样解析', date: '2026-07-18', views: 2210 },
    // materials
    { category: 'materials', type: 'article', title: '掐丝彩砂 · 天然彩砂色卡对照表',
      excerpt: '收录 128 种天然彩砂样本，附矿物学名称、产地、常见色号与调色配比。',
      content: '本色卡收录常用天然矿物彩砂 128 种，按色系分为红、黄、蓝、绿、紫、褐、白、黑八大类……', tags: '彩砂,色卡', date: '2026-07-15', views: 3421 },
    // brand
    { category: 'brand', type: 'image', title: '"承·匠"品牌新一季设计发布',
      excerpt: '本季以"数字之光·古法之温"为主题，共发布 32 款融合掐丝彩砂工艺的原创设计。',
      content: '本季设计融合了传统掐丝彩砂工艺与当代极简美学，共发布饰品、家居、文具三大品类 32 款作品……', tags: '首发', date: '2026-07-20', views: 5421 },
    // courses
    { category: 'courses', type: 'video', title: '掐丝彩砂基础 · 从入门到入迷（12课时）',
      excerpt: '国家级传承人张老师执教，从工具认识到独立完成作品的系统课程。',
      content: '课程共 12 课时，每课时 45 分钟。第 1 - 3 课时：工具与材料认识；第 4 - 6 课时：基础掐丝技法……', tags: '基础课,视频', date: '2026-07-15', views: 8231 }
]

export default db
