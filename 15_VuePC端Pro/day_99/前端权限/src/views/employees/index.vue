<template>
  <div class="employees-container">
    <div class="app-container">
      <page-tools>
        <template #left>
          <span>总记录数: 16 条</span>
        </template>

        <template #right>
          <el-button
            size="small"
            type="warning"
            @click="$router.push('/import?type=user')"
          >
            excel导入
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="clickExport"
          >
            excel导出
          </el-button>
          <el-button type="primary" size="small" @click="dialogFormVisible=true">新增员工</el-button>
        </template>
      </page-tools>

      <el-card style="margin-top: 10px;">
        <el-table v-loading="loading" border :data="list">
          <el-table-column label="序号" type="index" sortable="" />
          <el-table-column label="姓名" prop="username" sortable="" />
          <el-table-column label="头像" prop="staffPhoto">
            <template #default="{ row }">
              <img v-imgerror="defaultImg" class="staff" :src="row.staffPhoto" alt="" @click="clickShowCodeDialog(row.staffPhoto)">
            </template>
          </el-table-column>
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
              <el-button type="text" size="small" @click="$router.push(`/employees/detail/${row.id}`)">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
              <el-button
                type="text"
                size="small"
                :disabled="!checkPermission('POINT-USER-DELETE')"
                @click="delEmployee(row.id)"
              >
                删除
              </el-button>
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
    <el-dialog width="300px" title="二维码" :visible="showCodeDialog" :before-close="closeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <assign-role :show-role-dialog.sync="showRoleDialog" :user-id="userId" />
  </div>
</template>

<script>
import { reqGetEmployeeList, reqDelEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees'
import addEmployee from './components/add-employee.vue'
import { formatDate } from '@/filters'
import QrCode from 'qrcode'
import AssignRole from './components/assign-role.vue'
import checkPermission from '@/Mixins/checkPermission'
export default {
  name: 'Employees',
  components: { addEmployee, AssignRole },
  mixins: [checkPermission],
  data() {
    return {
      list: [],
      page: 1, // 当前页
      pageSize: 10, // 每页条数
      total: 0, // 总数
      loading: false,
      dialogFormVisible: false,
      defaultImg: 'https://dss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2146034403,1504718527&fm=26&gp=0.jpg',
      showCodeDialog: false,
      showRoleDialog: false,
      userId: null
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
    },
    async clickExport() {
    // 请注意: 如果导出的是当前页, 那么数据, this.list 即可,
    // 但是我们一般导出的是全部的数据, 需要请求到所有的数据
      const { data: { rows }} = await reqGetEmployeeList(1, this.total)
      const headersArr = ['姓名', '手机号', '入职日期', '聘用形式', '转正日期', '工号', '部门']
      const multiHeader = [['姓名', '主要信息', '', '', '', '', '部门']]
      const headersRelations = {
        '姓名': 'username',
        '手机号': 'mobile',
        '入职日期': 'timeOfEntry',
        '聘用形式': 'formOfEmployment',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName'
      }
      const dataArr = this.formatJson(rows, headersArr, headersRelations)
      const merges = ['A1:A2', 'B1:F1', 'G1:G2']

      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: headersArr, // 表格的头部
          // 二维数组 [ [], [], [] ]
          data: dataArr,
          filename: '学生信息表', // 导出的excel文件名
          autoWidth: true, // 是否开启单元格宽度自适应
          bookType: 'xlsx', // 类型
          multiHeader,
          merges
        })
      })
    },
    formatJson(rows, headersArr, headersRelations) {
    // [
    //   [ 值1, 值2, 值3, ... ]
    // ]
      const resultsArr = rows.map((item) => {
        const arr = []
        headersArr.forEach(key => {
          const englishKey = headersRelations[key]
          let value = item[englishKey]
          if (['timeOfEntry', 'correctionTime'].includes(englishKey)) {
            value = formatDate(value)
          }
          if (englishKey === 'formOfEmployment') {
            const obj = EmployeeEnum.hireType.find(obj => obj.id === value)
            value = obj ? obj.value : '未知'
          }
          arr.push(value)
        })
        return arr
      })
      return resultsArr
    },
    clickShowCodeDialog(url) {
      if (!url || url === '') return
      this.showCodeDialog = true
      this.$nextTick(() => {
      // 如果这里 url 写的是网址, 就会跳转到对应网址 (二维码分享效果)
        QrCode.toCanvas(this.$refs.myCanvas, url)
      })
    },
    closeDialog() {
      this.showCodeDialog = false
    },
    editRole(id) {
      this.userId = id
      this.showRoleDialog = true
    }
  }
}
</script>

<style lang="scss" scoped>
.employees-container {
  .staff {
    width: 70px;
    height: 70px;
    border-radius: 50%;
  }
}
</style>
