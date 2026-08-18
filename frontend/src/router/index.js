import { createRouter, createWebHistory } from 'vue-router'

const MainLayout = () => import('@/layouts/MainLayout.vue')
const AdminLayout = () => import('@/layouts/AdminLayout.vue')

const routes = [
    {
        path: '/',
        component: MainLayout,
        children: [
            { path: '', name: 'home', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
            { path: 'news', name: 'news', component: () => import('@/views/News.vue'), meta: { title: '非遗资讯' } },
            { path: 'theory', name: 'theory', component: () => import('@/views/Theory.vue'), meta: { title: '教育理论' } },
            { path: 'projects', name: 'projects', component: () => import('@/views/Projects.vue'), meta: { title: '非遗项目' } },
            { path: 'simulation', name: 'simulation', component: () => import('@/views/Simulation.vue'), meta: { title: '数字仿真 · 掐丝彩砂' } },
            { path: 'cultural', name: 'cultural', component: () => import('@/views/Cultural.vue'), meta: { title: '文创产品' } },
            { path: 'patterns', name: 'patterns', component: () => import('@/views/Patterns.vue'), meta: { title: '图案纹样' } },
            { path: 'materials', name: 'materials', component: () => import('@/views/Materials.vue'), meta: { title: '材料汇总' } },
            { path: 'brand', name: 'brand', component: () => import('@/views/Brand.vue'), meta: { title: '品牌发布' } },
            { path: 'courses', name: 'courses', component: () => import('@/views/Courses.vue'), meta: { title: '课程鉴赏' } },
            { path: 'academic', name: 'academic', component: () => import('@/views/Academic.vue'), meta: { title: '学术专题' } },
            { path: 'contact', name: 'contact', component: () => import('@/views/Contact.vue'), meta: { title: '联系我们' } },
            { path: 'article/:id', name: 'article', component: () => import('@/views/ArticleDetail.vue'), meta: { title: '内容详情' } },
            { path: 'search', name: 'search', component: () => import('@/views/Search.vue'), meta: { title: '搜索' } },
            { path: 'profile', name: 'profile', component: () => import('@/views/Profile.vue'), meta: { title: '个人中心', requiresUser: true } },
            { path: ':pathMatch(.*)*', name: 'notfound', component: () => import('@/views/NotFound.vue'), meta: { title: '页面未找到' } }
        ]
    },
    {
        path: '/admin/login',
        name: 'admin-login',
        component: () => import('@/views/admin/Login.vue'),
        meta: { title: '后台登录' }
    },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: '/admin/dashboard' },
            { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue'), meta: { title: '仪表盘' } },
            { path: 'articles', name: 'admin-articles', component: () => import('@/views/admin/Articles.vue'), meta: { title: '内容管理' } },
            { path: 'articles/edit/:id?', name: 'admin-article-edit', component: () => import('@/views/admin/ArticleEdit.vue'), meta: { title: '编辑内容' } },
            { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/Categories.vue'), meta: { title: '栏目管理' } },
            { path: 'homepage', name: 'admin-homepage', component: () => import('@/views/admin/HomeSettings.vue'), meta: { title: '首页设置' } },
            { path: 'users', name: 'admin-users', component: () => import('@/views/admin/Users.vue'), meta: { title: '用户管理' } },
            { path: 'media', name: 'admin-media', component: () => import('@/views/admin/Media.vue'), meta: { title: '媒体库' } },
            { path: 'logs', name: 'admin-logs', component: () => import('@/views/admin/LoginLogs.vue'), meta: { title: '登录日志' } },
            { path: 'settings', name: 'admin-settings', component: () => import('@/views/admin/Settings.vue'), meta: { title: '站点设置' } }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() { return { top: 0 } }
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? `${to.meta.title} · 非遗工艺数字化辅助设计与教学平台` : '非遗工艺数字化辅助设计与教学平台'
    const token = localStorage.getItem('token')
    if ((to.meta.requiresAuth || to.meta.requiresUser) && !token) {
        return next({ name: 'admin-login', query: { redirect: to.fullPath } })
    }
    // 管理员后台仅 admin 可进
    if (to.meta.requiresAuth) {
        try {
            const info = JSON.parse(localStorage.getItem('userInfo') || 'null')
            if (info?.role !== 'admin') return next('/profile')
        } catch {}
    }
    next()
})

export default router
