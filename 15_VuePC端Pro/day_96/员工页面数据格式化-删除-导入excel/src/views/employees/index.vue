<template>
  <div class="employees-container">
    <div class="app-container">
      <page-tools>
        <template #left>
          <span>总记录数: 16 条</span>
        </template>

        <template #right>
          <el-button size="small" type="warning" @click="$router.push('/import?type=user')">excel导入</el-button>
          <el-button type="danger" size="small">excel导出</el-button>
          <el-button type="primary" size="small" @click="dialogFormVisible=true">新增员工</el-button>
        </template>
      </page-tools>

      <el-card style="margin-top: 10px;">
        <el-table v-loading="loading" border :data="list">
          <el-table-column label="序号" type="index" sortable="" />
          <el-table-column label="姓名" prop="username" sortable="" />
          <el-table-column label="工号" prop="workNumber" sortable="" />
          <el-table-column label="聘用形式" prop="formOfEmployment" :formatter="formatEmployment" sortable="" />
          <el-table-column label="部门" prop="departmentName" sortable="" />
          <el-table-column label="入职时间" prop="timeOfEntry" sortable="">
            <template #default="{row}">
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column label="账户状态" prop="enableState" sortable="">
            <template #default="{row}">
              <el-switch
                :value="row.enableState===1"
                active-color="#13ce66"
                inactive-color="#ff4949"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template #default="{row}">
              <el-button type="text" size="small">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small">角色</el-button>
              <el-button type="text" size="small" @click="delEmployee(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <div style="height: 60px; margin-top: 10px">
          <el-pagination
            :total="total"
            :current-page="page"
            :page-size="pageSize"
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
    <add-employee :dialog-form-visible.sync="dialogFormVisible" />
  </div>
</template>

<script>
import { reqGetEmployeeList, reqDelEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees'
import addEmployee from './components/add-employee.vue'
export default {
  name: 'Employees',
  components: { addEmployee },
  data() {
    return {
      list: [],
      page: 1, // 当前页
      pageSize: 10, // 每页条数
      total: 0, // 总数
      loading: false,
      dialogFormVisible: false
    }
  },
  computed: {
    type() {
      return this.$route.query.type
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
    },
    handleCurrentChange(newPage) {
      this.page = newPage
      this.getEmployeeList()
    },
    formatEmployment(row, column, cellValue, index) {
      const obj = EmployeeEnum.hireType.find(item => item.id === cellValue)
      return obj ? obj.value : '未知'
    },
    delEmployee(id) {
      this.$confirm('确认删除该员工?', '温馨提示').then(
        async() => {
          await reqDelEmployee(id)
          if (this.list.length === 1 && this.page > 1) {
            this.page--
          }
          this.$message.success('删除成功')
          this.getEmployeeList()
        }
      ).catch(() => {
        console.log('取消')
      })
    }
  }
}
</script>

<style>

</style>
