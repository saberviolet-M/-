import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

const Login = () => import('@/views/Login')
const Layout = () => import('@/views/Layout')
const Search = () => import('@/views/Search')

const HomeIndex = () => import('@/views/Layout/Home')
const QuestionIndex = () => import('@/views/Layout/Question')
const VideoIndex = () => import('@/views/Layout/Video')
const UserIndex = () => import('@/views/Layout/User')

const SearchResult = () => import('@/views/Search/components/SearchResult')
const ArticleIndex = () => import('@/views/Article')

const UserProfile = () => import('@/views/Layout/User/components/UserProfile')
const UserChat = () => import('@/views/Layout/User/components/UserChat')

Vue.use(VueRouter)

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    children: [
      { path: '/', component: HomeIndex, meta: { isKeepAlive: true } },
      { path: '/question', component: QuestionIndex },
      { path: '/video', component: VideoIndex },
      { path: '/user', component: UserIndex }
    ]
  },
  { path: '/search', component: Search },
  { path: '/result', component: SearchResult },
  { path: '/article/:id', component: ArticleIndex, props: true },
  { path: '/userProfile', component: UserProfile },
  { path: '/userChat', component: UserChat },
  { path: '/*', component: Login }
]

const router = new VueRouter({
  routes
})

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

// 需要认证的页面
const AuthLinks = ['/user']
router.beforeEach((to, from, next) => {
  const token = store.state.user.tokenInfo.token
  if (to.path === '/login' && token) {
    next('/')
    return
  }
  console.log('to==>', to)
  // 如果是需要授权的页面
  if (AuthLinks.includes(to.path)) {
    // 进行验证身份
    if (token) {
      next()
    } else {
      // 拦截到登录
      next({
        path: '/login',
        query: {
          backTo: to.fullPath
        }
      })
    }
  } else {
    next()
  }
})
export default router
