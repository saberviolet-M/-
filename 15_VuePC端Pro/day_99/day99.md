# day99

### 前端权限-页面访问权(路由)

#### addRoutes 的基本使用

![addRoutes](./media/addRoutes.png)

- 分离动态路由`src/router/index.js`

  ```js
  export const constantRoutes = [
    ...
    // 改为动态添加，确保位于数组最后，正确过滤页面到404
    // { path: '*', redirect: '/404', hidden: true }
  ]
  const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: [
      ...constantRoutes
      // ...asyncRoutes
    ]
  })
  ```

- 新建**vuex modules**管理路由模块`src/store/modules/permission.js`

  ```js
  import { constantRoutes, asyncRoutes } from '@/router'
  
  const state = {
    routes: constantRoutes
  }
  const mutations = {
    setRoutes(state, otherRoutes) {
      state.routes = [
        ...state.routes,
        ...otherRoutes,
        { path: '*', redirect: '/404', hidden: true }
      ]
    }
  }
  const actions = {
    filterRoutes(context, menus) {
      const otherRoutes = asyncRoutes.filter(item => menus.includes(item.children[0].name))
      context.commit('setRoutes', otherRoutes)
      return otherRoutes
    }
  }
  export default {
    namespaced: true,
    state,
    mutations,
    actions
  }
  ```

  ![筛选](./media/筛选.png)

  根据角色权限**menus**的数据也会发生变化，根据**menus**过滤出需要展示的路由对象

- 修改**store**的**index**和**getters**

  ```js
  // index
  import permission from './modules/permission'
  
  const store = new Vuex.Store({
    modules: {
      ...
      permission
    },
    getters
  })
  ```

  ```js
  // getters
  const getters = {
    ...
    roles: state => state.user.userInfo.roles,
    routes: state => state.permission.routes
  }
  export default getters
  
  ```

- 路由加载`src/permission.js`

  ```js
  router.beforeEach(async(to, from, next) => {
    ...
    if (token) {
      ...
      } else {
        if (!store.state.user.userInfo.userId) {
          const { roles } = await store.dispatch('user/getUserInfo')
          // console.log('预留处理', roles, asyncRoutes)
          const otherRoutes = await store.dispatch('permission/filterRoutes', roles.menus)
          // console.log(otherRoutes)
          router.addRoutes([
            ...otherRoutes,
             // 需要将404放置到动态路由的最后
            { path: '*', redirect: '/404', hidden: true }
          ])
          next({
            ...to, // next({ ...to })的目的,是保证路由添加完了再进入页面 
            replace: true // 重进一次, 不保留重复历史
          })
          return
        }
        ...
      }
    } else {
      ...
    }
  })
  ```

- 管理页面菜单渲染`layout/components/Sidebar/index.vue`

  ```js
  computed: {
    ...mapGetters([
      'sidebar',
      'routes'
    ]),
    /* routes() {
      return this.$router.options.routes
    }, */
    ...
  }
  ```

- 退出时重置路由`store/modules/user.js`

  ```js
  import { resetRouter } from '@/router'
  
  // 退出的action操作
  logout(context) {
    // 1. 移除vuex个人信息
    context.commit('removeUserInfo')
    // 2. 移除token信息
    context.commit('removeToken')
    // 3. 重置路由
    resetRouter()
    // 4. 重置 vuex 中的路由信息
    context.commit('permission/setRoutes', [], { root: true })
  },
  ```

- 修改权限标识`src/router/modules`

  ![permission](./media/permission.png)

  ```js
  // permission.js
  export default {
    ...
    children: [
      {
        ...
        name: 'permissions',
        ...
      }
    ]
  }
  
  // setting.js
  export default {
    ...
    children: [
      {
        ...
        name: 'settings',
        ...
      }
    ]
  }
  
  // social
  export default {
    ...
    children: [
      {
        ...
        name: 'social_securitys',
        ...
      }
    ]
  }
  ```

### 前端权限 - 按钮操作权

![points](./media/points.png)

- 新建`src/Mixins/checkPermission.js`

  ```js
  export default {
    methods: {
      checkPermission(key) {
        return this.$store.getters.roles.points.includes(key)
      }
    }
  }
  ```

- `src/views/employees/index.vue`使用

  ```jsx
  // 以删除按钮为例
  <el-button
    type="text"
    size="small"
    :disabled="!checkPermission('POINT-USER-DELETE')"
    @click="delEmployee(row.id)"
  >
    删除
  </el-button>
  
  import checkPermission from '@/Mixins/checkPermission'
  
  export default {
    ...
    mixins: [checkPermission],
    ...
  }
  ```

  ![按钮权限](./media/按钮权限.png)

  无权限禁止