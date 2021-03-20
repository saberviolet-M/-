# day94

### 小优化&语言样式修改

#### 小优化

- `src/views/departments/index.vue`

  ```jsx
  <add-dept
    :show-dialog.sync="showDialog"  // sync修饰符
    :node-data="nodeData"
    :depts-list="deptsList"
    @add-depts="getDepartments"
    // @close-dialog="handleClose" 删除
  />
  
  
  // 删除
  /* handleClose(isClone) {
    this.showDialog = isClone
  }, */
  ```

- `src/views/departments/components/add-dept.vue`

  ```jsx
  // 取消时触发事件关闭弹窗
  <el-button size="small" @click="handleCloseDialog">取消</el-button>
  
  handleCloseDialog() {
    this.$emit('update:showDialog', false) // 用false更新父组件的showDialog属性值
    this.$refs.deptForm.resetFields()
  },
  
  clickSubmit() {
    this.$refs.deptForm.validate(async isOK => {
      if (isOK) {
        ...
        // 调用方法 - 关闭弹层
        this.handleCloseDialog()
      }
    })
  }
  ```

#### 语言样式修改

- `src/main.js`

  ```js
  /**
   * 修改为中文语言包
   */
  
  // import locale from 'element-ui/lib/locale/lang/en' // lang i18n
  
  // set ElementUI lang to EN
  // Vue.use(ElementUI, { locale })
  // 如果想要中文版 ele
  Vue.use(ElementUI)
  ```

## 编辑部门

> 点击编辑弹出层，记录当前节点 用于回显数据

- `src/views/departments/components/tree-tools.vue`

  ```js
  handleCommand(type) {
    ...
    if (type === 'edit') {
      // console.log(type)
      this.$emit('edit-depts', this.nodeData)
    }
    ...
    }
  }
  ```

- `src/views/departments/index.vue`

  ```jsx
  <template #default="{ data }">
    <tree-tools
      :node-data="data"
      @del-depts="getDepartments"
      @add-depts="handleAddDepts"
      @edit-depts="handleEditDepts"
    />
  </template>
  
  handleEditDepts(nodeData) {
    this.showDialog = true
    this.nodeData = nodeData
    this.$refs.addDeptDialog.getDepartDetail(nodeData.id)
  }
  ```

- 封装获取部门信息的模块 `src/api/departments.js`

  ```js
  /** *
   * 获取部门详情
   * ***/
  export function reqGetDepartDetail(id) {
    return request({
      url: `/company/department/${id}`
    })
  }
  ```

- `src/views/departments/components/add-dept.vue`

  ```jsx
  /* 提供获取详情的方法 */
  async getDepartDetail(id) {
    const { data } = await reqGetDepartDetail(id)
    this.form = data
    console.log(data)
  }
  ```

  ```jsx
  /* 计算属性 - 控制标题 */
  computed: {
    showTitle() {
      return this.form.id ? '编辑部门' : '新增部门'
    }
  },
  ```

  ```jsx
  /* 重置数据 */
  closeDialog() {
    // 子传父, 通知到父组件, 将布尔值改成false
    // 重置数据
    this.form = {
      name: '', // 部门名称
      code: '', // 部门编码
      manager: '', // 管理者
      introduce: '' // 部门介绍
    }
    this.$emit('update:showDialog', false)
    this.$refs.deptForm.resetFields()
  },
  ```

### 同时支持编辑和新增场景

- 封装编辑部门接口   `src/api/departments.js`

  ```js
  /**
   * 编辑部门
   ***/
  export function reqUpdateDepartments(data) {
    return request({
      url: `/company/department/${data.id}`,
      method: 'put',
      data
    })
  }
  ```

- `src/views/departments/components/add-dept.vue`点击确定时，进行场景区分

  ```js
  clickSubmit() {
    this.$refs.deptForm.validate(async isOK => {
      if (isOK) {
        if (this.form.id) {
          // 编辑
          const res = await reqUpdateDepartments(this.form)
          console.log(res)
        } else {
          // 表示可以提交了
          // 调用新增接口 添加父部门的id
          await reqAddDepartments({ ...this.form, pid: this.nodeData.id })
        }
        // 通知到父组件, 添加操作
        this.$emit('add-depts')
        // 子传父
        this.$emit('update:showDialog', false)
      }
    })
  },
  ```

- 修改校验规则

  ```jsx
  // 校验code是否有重复项
  const checkCodeRepeat = (rule, value, callback) => {
    // 如果是编辑操作, 是可以和原来的自己的code重复的
    if (this.form.id && this.nodeData.code === value) {
      callback()
      return
    }
    // 正常校验
    const flag = this.deptsList.some(item => item.code === value)
    flag ? callback(new Error(`已经存在名字为 ${value} 的编码了`)) : callback()
  }
  
  // value 校验的表单元素的值
  // callback 校验的回调, 成功需要调用 callback() 失败需要调用 callback(new Error('错误信息'))
  const checkNameRepeat = (rule, value, callback) => {
    // 根据nodeData.id, 作为要找的节点的pid, 找财务部下的所有同级节点
    // 根据nodeData.pid, 作为要找的节点的pid, 找财务部的兄弟节点
    let arr = []
    if (this.form.id) {
      if (this.nodeData.name === value) {
        callback()
        return
      }
      arr = this.deptsList.filter(item => this.nodeData.pid === item.pid)
    } else {
      arr = this.deptsList.filter(item => this.nodeData.id === item.pid)
    }
    const flag = arr.some(item => item.name === value)
    flag ? callback(new Error(`已经存在名字为 ${value} 的部门了`)) : callback()
  }
  ```

### 优化: 添加加载数据进度条

- `src/views/departments/index.vue`

  ```jsx
  /* 赋值变量给指令 */
  <el-card v-loading="loading" class="tree-card">
      
  /* 定义loading变量 */
  data() {
    return {
      ...
      loading: false
    }
  },
      
  /* 获取方法前后设置变量 */
  async getDepartments() {
    this.loading = true
  
    const { data } = await reqGetDepartments()
    this.company = {
      name: data.companyName,
      manager: data.companyManage || '负责人',
      id: '' // 将来可以作为pid, 找到所有的一级, 进行是否repeat的判断
    }
    this.departs = tranListToTreeData(data.depts, '') // departs 树形结构数据
    this.deptsList = data.depts // 存储列表式的数据(方便遍历)
  
    this.loading = false
  },
  ```

## 公司角色设置 setting

![setting](./media/setting.png)

- `src/views/setting/index.vue`结构

  > [**table组件**](https://element.eleme.cn/#/zh-CN/component/table)

  ```jsx
  <template>
    <div class="setting-container">
      <div class="app-container">
        <el-card>
          <el-tabs>
            <!-- 左侧 -->
            <el-tab-pane label="角色管理">
              <!-- 按钮 -->
              <el-button
                icon="el-icon-plus"
                size="small"
                type="primary"
              >新增角色</el-button>
              <!-- 表格 -->
              <el-table>
                <el-table-column label="序号" width="100" />
                <el-table-column label="角色名称" width="240" />
                <el-table-column label="描述" />
                <el-table-column label="操作">
                  <el-button size="small" type="success">分配权限</el-button>
                  <el-button size="small" type="primary">编辑</el-button>
                  <el-button size="small" type="danger">删除</el-button>
                </el-table-column>
              </el-table>
            </el-tab-pane>
  
            <el-tab-pane label="公司信息">
              <!-- 公司信息 -->
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </div>
  </template>
  ```

- 接口封装，新建`src/api/setting.js`

  ```js
  import request from '@/utils/request'
  /**
   * 获取角色列表
   * ***/
  export function reqGetRoleList(page, pagesize) {
    return request({
      method: 'get',
      url: '/sys/role',
      params: {
        page,
        pagesize
      }
    })
  }
  ```

- `src/views/setting/index.vue`数据处理

  ```jsx
  <script>
  import { reqGetRoleList } from '@/api/setting'
  export default {
    name: 'Setting',
    data() {
      return {
        list: [],
        page: 1, // 当前页
        pagesize: 10, // 每页条数
        total: 0 // 总条数
      }
    },
    created() {
      this.getRoleList() // 获取角色列表
    },
    methods: {
      async getRoleList() {
        const { data } = await reqGetRoleList(this.page, this.pagesize)
        const { total, rows } = data
        this.total = total
        this.list = rows
      }
    }
  }
  </script>
  ```

-  绑定表格数据

  ```jsx
  <!-- 表格 -->
  <el-table :data="list">
    <el-table-column type="index" label="序号" width="120" />
    <el-table-column prop="name" label="角色名称" width="240" />
    <el-table-column prop="description" label="描述" />
    <el-table-column label="操作">
      <el-button size="small" type="success">分配权限</el-button>
      <el-button size="small" type="primary">编辑</el-button>
      <el-button size="small" type="danger">删除</el-button>
    </el-table-column>
  </el-table>
  ```

### 处理分页

- `src/views/setting/index.vue`

  > [**Pagination组件**](https://element.eleme.cn/#/zh-CN/component/pagination)

  ```jsx
  <template>
    <div class="setting-container">
      <div class="app-container">
        <el-card>
          ...
          <el-pagination
            :current-page="page"
            :page-sizes="[1, 2, 3, 4, 5]"
            :page-size="pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-card>
      </div>
    </div>
  </template>
  ```

- 绑定分页数据

  ```jsx
  <!-- 分页组件 -->
  <!--
    属性:
      1. current-page 标记当前页 (谁高亮)
      2. page-sizes 可供选择的每页条数列表
      3. page-size 起作用的每页条数
      4. layout 布局, 控制是展示的控件列表布局
      5. total 总条数
    方法:
      @size-change="handleSizeChange" 每页条数变化
      @current-change="handleCurrentChange" 当前页变化
  -->
  <el-pagination
    :current-page="page"
    :page-sizes="[1, 2, 3, 4, 5]"
    :page-size="pagesize"
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
  
  
  // 修改了每页条数后, 会造成页数的变化, 推荐从第一页重新开始展示
  handleSizeChange(val) {
    // console.log(`每页 ${val} 条`)
    // 更新每页条数
    this.pagesize = val
    // 重置当前页
    this.page = 1
    // 调用方法, 重新请求
    this.getRoleList()
  },
  handleCurrentChange(val) {
    // console.log(`当前页: ${val}`)
    // 更新当前页
    this.page = val
    // 调用方法, 重新请求渲染
    this.getRoleList()
  }
  ```

- 处理序号问题

  ```jsx
  <el-table-column type="index" :index="indexMethod" label="序号" width="120" />
  
  indexMethod(index) {
    return (this.page - 1) * this.pagesize + index + 1
  }
  ```

### 添加表格loading效果

```jsx
<el-table v-loading="loading" :data="list">
  
data () {
	return {
		loading: false
	}
}
    
async getRoleList() {
  this.loading = true
  const { data } = await reqGetRoleList(this.page, this.pagesize)
  const { total, rows } = data
  this.total = total
  this.list = rows
  this.loading = false
},
```

