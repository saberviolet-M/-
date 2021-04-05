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
              @click="handleAddRole"
            >
              新增角色
            </el-button>
            <!-- 表格 -->
            <el-table v-loading="loading" :data="list">
              <el-table-column type="index" :index="indexMethod" label="序号" width="120" />
              <el-table-column prop="name" label="角色名称" width="240" />
              <el-table-column prop="description" label="描述" />
              <el-table-column label="操作">
                <template #default="{row}">
                  <el-button size="small" type="success" @click="clickShowAssignDialog(row.id)">分配权限</el-button>
                  <el-button size="small" type="primary" @click="handleEdit(row.id)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDel(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
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
        </el-tabs>
        <el-pagination
          :current-page="page"
          :page-sizes="[pagesize, 1, 2, 3, 4, 5, 10]"
          :page-size="pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-card>
      <role
        ref="roleForm"
        :dialog-form-visible.sync="dialogFormVisible"
        @reload="getRoleList"
      />
      <privileges ref="privileges" :show-assign-dialog.sync="showAssignDialog" />
    </div>
  </div>
</template>
<script>
import { reqGetRoleList, reqDeleteRoleById, reqGetRoleDetail } from '@/api/setting'
import { reqGetCompanyById } from '@/api/company'
import Role from './components/role.vue'
import Privileges from './components/privileges.vue'
import { mapState } from 'vuex'
export default {
  name: 'Setting',
  components: { Role, Privileges },
  data() {
    return {
      list: [],
      page: 1, // 当前页
      pagesize: 10, // 每页条数
      total: 0, // 总条数
      loading: false,
      dialogFormVisible: false,
      companyForm: {},
      showAssignDialog: false
    }
  },
  computed: {
    ...mapState('user', ['userInfo'])
  },
  created() {
    this.getRoleList() // 获取角色列表
    this.getCompanyInfo()
  },
  methods: {
    async getRoleList() {
      this.loading = true
      const { data } = await reqGetRoleList(this.page, this.pagesize)
      const { total, rows } = data
      this.total = total
      this.list = rows
      this.loading = false
    },
    handleSizeChange(val) {
      // 更新每页条数
      this.pagesize = val
      // 重置当前页
      this.page = 1
      // 调用方法, 重新请求
      this.getRoleList()
    },
    handleCurrentChange(val) {
      // 更新当前页
      this.page = val
      // 调用方法, 重新请求渲染
      this.getRoleList()
    },
    indexMethod(index) {
      return (this.page - 1) * this.pagesize + index + 1
    },
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
    handleAddRole() {
      this.dialogFormVisible = true
    },
    async handleEdit(id) {
      this.dialogFormVisible = true
      const { data } = await reqGetRoleDetail(id)
      this.$refs.roleForm.form = data
    },
    async getCompanyInfo() {
      const { data } = await reqGetCompanyById(this.userInfo.companyId)
      this.companyForm = data
    },
    clickShowAssignDialog(id) {
      this.showAssignDialog = true
      this.$refs.privileges.roleId = id
    }
  }
}
</script>
