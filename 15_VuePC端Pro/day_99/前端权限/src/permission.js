import router from '@/router'
import store from '@/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import { asyncRoutes } from '@/router'

const whiteList = ['/login', '/404']

router.beforeEach(async(to, from, next) => {
  const token = store.getters.token
  NProgress.start()
  if (token) {
    if (to.path === '/login') {
      next('/')
      NProgress.done()
    } else {
      if (!store.state.user.userInfo.userId) {
        const { roles } = await store.dispatch('user/getUserInfo')
        console.log('预留处理', roles, asyncRoutes)
        const otherRoutes = await store.dispatch('permission/filterRoutes', roles.menus)
        console.log(otherRoutes)
        router.addRoutes([
          ...otherRoutes,
          { path: '*', redirect: '/404', hidden: true }
        ])
        next({
          ...to,
          replace: true
        })
        return
      }
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
