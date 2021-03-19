# day92

### 路由设计思想

- 简单项目

  ![简单项目](./media/简单项目.png)

- 中台项目

  ![中台项目](./media/中台项目.png)

  

- 拆分多个模块便于更好的权限的**控制** 和 **维护**

  ![路有权限](./media/路有权限.png)

## 路由页面整理

- 删除多余的路由表`src/router/index.js`

  ```js
  export const constantRoutes = [
    {
      path: '/login',
      component: () => import('@/views/login/index'),
      hidden: true
    },
  
    {
      path: '/404',
      component: () => import('@/views/404'),
      hidden: true
    },
  
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [{
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '首页', icon: 'dashboard' }
      }]
    },
    // 404 page must be placed at the end !!!
    { path: '*', redirect: '/404', hidden: true }
  ]
  ```

## 业务模块页面的搭建

- `src\views`

  ```bash
  ├──views
    ├── approvals           # 审批
    ├── attendances         # 考勤
    ├── dashboard           # 首页 -- 已有
    ├── departments         # 组织架构
    ├── employees           # 员工
    ├── login               # 登录 -- 已有
    ├── permission          # 权限管理
    ├── salarys             # 工资
    ├── setting             # 公司设置
    ├── social              # 社保
    ├── 404                 # 404 -- 已有
  ```

- 利用 git bash(linux环境) 命令

  ```bash
  $ mkdir approvals attendances departments employees permission salarys setting social 
  ```

- 标准的模板建立

  ```jsx
  <template>
    <div class="dashboard-container">
      <div class="app-container">
        <h2>
          首页
        </h2>
      </div>
    </div>
  </template>
  
  <script>
  export default {
  
  }
  </script>
  
  <style>
  
  </style>
  ```

## 新建路由模块

- `src/router/modules`

  ```bash
  ├── router               # 路由目录
   ├── index.js            # 路由主文件
   ├── modules             # 模块目录
    ├── approvals.js       # 审批  			图标: tree-table
    ├── attendances.js     # 考勤  			图标: skill
    ├── departments.js     # 组织架构 	 图标: tree
    ├── employees.js       # 员工 			图标: people
    ├── permission.js      # 权限管理		 图标: lock
    ├── salarys.js         # 工资				图标: money
    ├── setting.js         # 公司设置		 图标: setting
    ├── social.js          # 社保			  图标: table 
  ```

- 利用 git bash(linux环境) 命令

  ```bash
  $ touch approvals.js attendances.js departments.js employees.js permission.js setting.js salarys.js salarys.js social.js 
  ```

- 路由模块改写（`src/router/modules/departments.js`例）

  ```js
  import Layout from '@/layout'
  
  export default {
    path: '/departments',
    component: Layout,
    children: [
      {
        path: '',
        name: 'departments',
        component: () => import('@/views/departments'),
        meta: { title: '组织架构', icon: 'tree' }
      }
    ]
  }
  ```

### 静态路由和动态路由临时合并，形成左侧菜单

- `src/router/index.js`

  ```js
  import approvalsRouter from './modules/approvals'
  import departmentsRouter from './modules/departments'
  import employeesRouter from './modules/employees'
  import permissionRouter from './modules/permission'
  import attendancesRouter from './modules/attendances'
  import salarysRouter from './modules/salarys'
  import settingRouter from './modules/setting'
  import socialRouter from './modules/social'
  
  export const asyncRoutes = [
    approvalsRouter,
    departmentsRouter,
    employeesRouter,
    permissionRouter,
    attendancesRouter,
    salarysRouter,
    settingRouter,
    socialRouter
  ]
  const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: [...constantRoutes, ...asyncRoutes]
  })
  ```

- 处理高亮激活 (可选) `src/styles/sidebar.scss`

  ```js
  .el-menu {
    ...
    a{
      li{
        ...
      }
      li.is-active{
        background-color: #fff!important;
        .svg-icon{
          color:#43a7fe;
        }
        span{
          color: #43a7fe;
        }
      }
      ...
    }
  }
  ```

## 目标业务模块 - 组织架构 departments

![组织架构tree](./media/组织架构tree.png)

### 封装单独的树操作栏组件

- `src/views/departments/components/tree-tools.vue`

  ```jsx
  <template>
    <el-row
      type="flex"
      justify="space-between"
      align="middle"
      style="height: 40px; width: 100%;"
    >
      <el-col :span="20">
        <span>{{ nodeData.name }}</span>
      </el-col>
      <el-col :span="4">
        <el-row type="flex" justify="end">
          <!-- 两个内容 -->
          <el-col>{{ nodeData.manager }}</el-col>
          <el-col>
            <!-- 下拉菜单 element -->
            <el-dropdown>
              <span @click.stop>操作<i class="el-icon-arrow-down" /> </span>
              <!-- 下拉菜单 -->
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>添加子部门</el-dropdown-item>
                <el-dropdown-item v-if="!isRoot">编辑部门</el-dropdown-item>
                <el-dropdown-item v-if="!isRoot">删除部门</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </template>
  
  <script>
  export default {
    props: {
      // 定义传入的属性
      nodeData: {
        type: Object,
        required: true
      },
      // 是否根节点
      isRoot: {
        type: Boolean,
        default: false
      }
    }
  }
  </script>
  ```

- `src/views/departments/index.vue`

  ```jsx
  <template>
    <div class="departments-container">
      <div class="app-container">
        <el-card class="tree-card">
          <!-- 用了一个行列布局 -->
          <tree-tools :node-node="company" :is-root="true" />
  
          <!-- 放置一个el-tree组件 -->
          <el-tree
            :data="departs"
            :props="defaultProps"
            :default-expand-all="true"
          >
            <!-- 用了一个行列布局 -->
            <template #default="{ data }">
              <tree-tools :node-data="data" />
            </template>
          </el-tree>
        </el-card>
      </div>
    </div>
  </template>
  
  <script>
  import treeTools from './components/tree-tools.vue'
  import { reqGetDepartments } from '@/api/departments'
  import { transListToTreeData } from '@/utils/index'
  export default {
    name: 'Departments',
    components: { treeTools },
    data() {
      return {
        departs: [],
        defaultProps: {
          label: 'name',
          children: 'children'
        },
        company: {}
      }
    },
    created() {
      this.getDepartments()
    },
    methods: {
      async getDepartments() {
        const { data: { companyName, depts }} = await reqGetDepartments()
        this.company = {
          name: companyName,
          manager: '负责人'
        }
        console.log(depts)
        this.departs = transListToTreeData(depts, '')
        console.log(this.departs)
      }
    }
  }
  </script>
  
  <style scoped>
  .tree-card {
    padding: 30px 30px;
    font-size:14px;
  }
  </style>
  
  ```

### 封装API接口，获取数据

- 新建`src/api/departments.js`

  ```js
  import request from '@/utils/request'
  
  export function reqGetDepartments() {
    return request({
      url: '/company/department',
      method: 'get'
    })
  }
  ```

- 在钩子函数中调用接口

### 将数组数据转化成树形结构

![树化结构](./media/树化结构.png)



- 封装一个工具方法，`src/utils/index.js`

  ```js
  /**
   * 将列表型的数据转换成树形数据 => 递归算法
   * 这里是要建立树形结构, 所以一定要找一个头
   */
  export function tranListToTreeData(list, rootValue) {
    const arr = []
    list.forEach(item => {
      if (item.pid === rootValue) {
        // 以 item.id 作为 父 id, 接着往下找
        const children = tranListToTreeData(list, item.id)
        if (children.length > 0) {
          item.children = children
        }
        // 将item项, 追加到arr数组中
        arr.push(item)
      }
    })
    return arr
  }
  ```

