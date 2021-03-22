# day95

### 公司设置-删除

- 封装接口`src/api/setting.js`

  ```js
  /**
   * 根据id删除角色
   * @param {number} id
   * @return request
   */
  export function reqDeleteRoleById(id) {
    return request({
      method: 'delete',
      url: `/sys/role/${id}`
    })
  }
  ```

- 注册事件`src/views/setting/index.vue`

  ```jsx
  <el-table-column label="操作">
    <template #default="{row}">
      ...
      <el-button size="small" type="danger" @click="handleDel(row.id)">删除</el-button>
    </template>
  </el-table-column>
  ```

- 业务逻辑

  ```jsx
  handleDel(id) {
    this.$confirm('你确定要删除么？', '温馨提示').then(
      async() => {
        await reqDeleteRoleById(id)
        if (this.list.length === 1 && this.page > 1) {
          this.page--
        }
        this.getRoleList() // 获取角色列表
        this.$message.success('删除成功')
      }
    ).catch(err => {
      console.log(err)
    })
  },
  ```

### 公司设置-新增 || 公司设置-修改

- 封装接口`src/api/setting.js`

  ```js
  /**
   * 添加角色
   */
  export function reqAddRole(data) {
    return request({
      method: 'post',
      url: `/sys/role`,
      data
    })
  }
  
  /**
   * 根据id修改角色
   */
  export function reqUpdateRoleById(data) {
    return request({
      method: 'put',
      url: `/sys/role/${data.id}`,
      data
    })
  }
  
  /**
   * 根据 id 获取角色详情, 用于回显
   * **/
  export function reqGetRoleDetail(id) {
    return request({
      method: 'get',
      url: `/sys/role/${id}`
    })
  }
  ```

- 注册点击事件`src/views/setting/index.vue`

  - 新增

    ```jsx
    <!-- 按钮 -->
    <el-button
      icon="el-icon-plus"
      size="small"
      type="primary"
      @click="handleAddRole"
    >
      新增角色
    </el-button>
    ```

  - 修改

    ```jsx
    <el-table-column label="操作">
      <template #default="{row}">
        ...
        <el-button size="small" type="primary" @click="handleEdit(row.id)">编辑</el-button>
        ...
      </template>
    </el-table-column>
    ```

- 新建组件`src/views/setting/components/role.vue`

  ```jsx
  <template>
    <el-dialog :title="showTitle" :visible="dialogFormVisible" @close="closeDialog">
      <el-form ref="roleForm" :model="form" :rules="rules">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="form.description" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="handleConfirmBtn">确 定</el-button>
      </div>
    </el-dialog>
  </template>
  ```

- 注册使用`src/views/setting/index.vue`

  ```jsx
  ...
  </el-card>
  <role
    ref="roleForm"
    :dialog-form-visible.sync="dialogFormVisible"
    @reload="getRoleList"
  />
  
  import Role from './components/role.vue'
  
  components: { Role },
      
  data() {
    return {
      ...
      dialogFormVisible: false, // 是否展示弹框
    }
  },
  
  // 添加时调出弹框
  handleAddRole() {
    this.dialogFormVisible = true
  },
  // 传入详细信息作修改时使用
  async handleEdit(id) {
    this.dialogFormVisible = true
    const { data } = await reqGetRoleDetail(id)
    this.$refs.roleForm.form = data
  },
  ```

- `src/views/setting/components/role.vue`

  ```jsx
  <script>
  // 调用方法
  import { reqAddRole, reqUpdateRoleById } from '@/api/setting'
  export default {
    name: 'Role',
    // 接收参数，判断是否展示弹出框
    props: {
      dialogFormVisible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        // 表单校验规则
        rules: {
          name: [
            { required: true, message: '请输入角色姓名', trigger: ['blur', 'change'] }
          ]
        },
        // 表单显示的数据依据
        form: {
          name: '',
          description: '',
          id: ''
        }
      }
    },
    computed: {
      // 通过id判断是增加还是修改
      showTitle() {
        return this.form.id ? '编辑角色' : '添加角色'
      }
    },
    methods: {
      // 为下次调取弹框时清除残留数据
      resetForm() {
        // 重置表单内容的校验状态
        this.$refs.roleForm.resetFields()
        this.form = {
          name: '',
          description: '',
          id: ''
        }
      },
      // 关闭弹框--通过发布事件通知父组件关闭弹窗
      closeDialog() {
        this.$emit('update:dialogFormVisible', false)
        this.resetForm()
      },
      handleConfirmBtn() {
        // 发送请求之前的表单校验
        this.$refs.roleForm.validate(
          async flag => {
            if (!flag) return
            // 判断调用修改接口还是增加接口
            if (this.form.id) {
              await reqUpdateRoleById(this.form)
              this.$message.success('修改成功')
            } else {
              await reqAddRole(this.form)
              this.$message.success('添加成功')
            }
            // 关闭弹框
            this.closeDialog()
            // 通知父组件刷新视图
            this.$emit('reload')
            this.resetForm()
          }
        )
      }
    }
  }
  </script>
  ```

### 公司设置-公司信息

- 新建`src/api/company.js`封装接口

  ```js
  // 企业相关
  import request from '@/utils/request'
  
  // 根据 id 查询企业
  export const reqGetCompanyById = (id) => {
    return request({
      method: 'get',
      url: `/company/${id}`
    })
  }
  ```

- 添加结构`src/views/setting/index.vue`

  ```jsx
  <!-- 公司信息 -->
  <el-tab-pane label="公司信息">
    <!-- 警告信息 -->
    <el-alert
      title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
      type="info"
      show-icon
      :closable="false"
    />
    <!-- 表单 -->
    <el-form label-width="120px" style="margin-top:50px">
      <el-form-item label="公司名称">
        <el-input v-model="companyForm.name" disabled style="width:400px" />
      </el-form-item>
      <el-form-item label="公司地址">
        <el-input v-model="companyForm.companyAddress" disabled style="width:400px" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="companyForm.mailbox" disabled style="width:400px" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="companyForm.remarks" type="textarea" :rows="3" disabled style="width:400px" />
      </el-form-item>
    </el-form>
  </el-tab-pane>
  ```

- 调用接口

  ```jsx
  // 引入接口
  import { reqGetCompanyById } from '@/api/company'
  // 通过vuex 拿到companyId
  import { mapState } from 'vuex'
  
  data() {
    return {
      ...
      companyForm: {}
    }
  },
  computed: {
    ...mapState('user', ['userInfo'])
  },
  created() {
      ...
      this.getCompanyInfo()
  },
  methods: {
    ...
    async getCompanyInfo() {
      const { data } = await reqGetCompanyById(this.userInfo.companyId)
      this.companyForm = data
    }
  }
  ```

## 员工管理模块

### 封装一个通用的工具栏

- 新建`src/components/PageTools/index.vue`

  ```jsx
  <template>
    <el-card>
      <div class="page-tools">
        <!-- 左侧 -->
        <div class="left">
          <div v-if="$slots.left" class="tips">
            <i class="el-icon-info" />
            <slot name="left" />
          </div>
        </div>
        <!-- 右侧 -->
        <div class="right">
          <slot name="right" />
        </div>
      </div>
    </el-card>
  </template>
  
  <script>
  export default {
  
  }
  </script>
  
  <style lang="scss" scoped>
  .page-tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tips {
      line-height: 34px;
      padding: 0px 15px;
      border-radius: 5px;
      border: 1px solid rgba(145, 213, 255, 1);
      background: rgba(230, 247, 255, 1);
      i {
        margin-right: 10px;
        color: #409eff;
      }
    }
  }
  </style>
  
  ```

### 统一全局注册 - Vue.use - Vue插件机制

> [利用 `Vue.use` 统一全局注册组件](https://cn.vuejs.org/v2/api/#Vue-use)
>
> - Vue.use 可以接收一个对象, Vue.use(obj)  
>
> - 对象中需要提供一个 install 函数
>
> - install 函数可以拿到参数 Vue, 且将来会在 Vue.use 时, 自动调用该 install 函数

- 新建` src/componets/index.js`

  ```js
  // 该文件负责所有的公共组件的全局注册
  // vue插件机制: Vue.use
  import PageTools from './PageTools'
  
  export default {
    install(Vue) {
      Vue.component('PageTools', PageTools)
    }
  }
  ```

-  `src/main.js` Vue.use 注册使用自己的插件模块

  ```js
  import Components from './components'
  Vue.use(Components)
  ```

### 员工列表页面

- `src/employees/index.vue`结构

  ```jsx
  <template>
    <div class="employees-container">
      <div class="app-container">
        <page-tools>
          <template #left>
            <span>总记录数: 16 条</span>
          </template>
  
          <template #right>
            <el-button type="warning" size="small">excel导入</el-button>
            <el-button type="danger" size="small">excel导出</el-button>
            <el-button type="primary" size="small">新增员工</el-button>
          </template>
        </page-tools>
  
        <el-card style="margin-top: 10px;">
          <el-table border>
            <el-table-column label="序号" sortable="" />
            <el-table-column label="姓名" sortable="" />
            <el-table-column label="工号" sortable="" />
            <el-table-column label="聘用形式" sortable="" />
            <el-table-column label="部门" sortable="" />
            <el-table-column label="入职时间" sortable="" />
            <el-table-column label="账户状态" sortable="" />
            <el-table-column label="操作" sortable="" fixed="right" width="280">
              <template>
                <el-button type="text" size="small">查看</el-button>
                <el-button type="text" size="small">转正</el-button>
                <el-button type="text" size="small">调岗</el-button>
                <el-button type="text" size="small">离职</el-button>
                <el-button type="text" size="small">角色</el-button>
                <el-button type="text" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页组件 -->
          <div style="height: 60px; margin-top: 10px">
            <el-pagination layout="prev, pager, next" />
          </div>
        </el-card>
      </div>
    </div>
  </template>
  ```

- 封装接口`src/api/employees.js`

  ```js
  /**
   * 获取员工的综合列表数据 (分页)
   * ***/
  export function reqGetEmployeeList(page, size) {
    return request({
      methods: 'get',
      url: '/sys/user',
      params: {
        page,
        size
      }
    })
  }
  ```

- `src/employees/index.vue`调用接口

  ```jsx
  import { reqGetEmployeeList } from '@/api/employees'
  export default {
    name: 'Employees',
    data() {
      return {
        list: [],
        page: 1, // 当前页
        pageSize: 10, // 每页条数
        total: 0, // 总数
        loading: false
      }
    },
    created() {
      this.getEmployeeList()
    },
    methods: {
      async getEmployeeList() {
        this.loading = true
        const { data } = await reqGetEmployeeList(this.page, this.pageSize)
        const { total, rows } = data
        this.total = total
        this.list = rows
        this.loading = false
      }
    }
  }
  ```

- 绑定表格

  ```jsx
  <el-card style="margin-top: 10px;">
    <el-table v-loading="loading" border :data="list">
      <el-table-column label="序号" type="index" sortable="" />
      <el-table-column label="姓名" prop="username" sortable="" />
      <el-table-column label="工号" prop="workNumber" sortable="" />
      <el-table-column label="聘用形式" prop="formOfEmployment" sortable="" />
      <el-table-column label="部门" prop="departmentName" sortable="" />
      <el-table-column label="入职时间" prop="timeOfEntry" sortable="" />
      <el-table-column label="账户状态" prop="enableState" sortable="" />
      <el-table-column label="操作" sortable="" fixed="right" width="280">
        <template>
          <el-button type="text" size="small">查看</el-button>
          <el-button type="text" size="small">转正</el-button>
          <el-button type="text" size="small">调岗</el-button>
          <el-button type="text" size="small">离职</el-button>
          <el-button type="text" size="small">角色</el-button>
          <el-button type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <div style="height: 60px; margin-top: 10px">
      <el-pagination layout="prev, pager, next" />
    </div>
  </el-card>
  ```

- 员工的分页处理

  ```jsx
  <div style="height: 60px; margin-top: 10px">
    <el-pagination
      :total="total"
      :current-page="page"
      :page-size="pageSize"
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
    />
  </div>
  
  handleCurrentChange(newPage) {
    this.page = newPage
    this.getEmployeeList()
  }
  ```

  