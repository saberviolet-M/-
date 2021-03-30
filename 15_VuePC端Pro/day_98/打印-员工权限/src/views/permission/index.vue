<template>
  <div class="permission-container">
    <div class="app-container">
      <!-- 表格 -->
      <el-card>
        <div style="text-align: right; margin-bottom: 20px">
          <el-button type="primary" size="small" @click="clickAdd(1, '0')">添加权限</el-button>
        </div>
        <el-table border :data="list" row-key="id">
          <el-table-column label="名称" prop="name" />
          <el-table-column label="标识" prop="code" />
          <el-table-column label="描述" prop="description" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button v-if="row.type === 1" size="small" type="text" @click="clickAdd(2, row.id)">添加权限点</el-button>
              <el-button size="small" type="text" @click="clickShowEdit(row.id)">查看</el-button>
              <el-button size="small" type="text" @click="clickDel(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <add-permission ref="addPermission" :show-dialog.sync="showDialog" />
    </div>
  </div>
</template>

<script>
import { reqGetPermissionList, reqDelPermission, reqGetPermissionDetail } from '@/api/permission'
import { transListToTreeData } from '@/utils'
import AddPermission from './components/add-permission.vue'

export default {
  name: 'Permission',
  components: { AddPermission },
  data() {
    return {
      list: [],
      showDialog: false
    }
  },
  created() {
    this.getPermissionList()
  },
  methods: {
    async getPermissionList() {
      const { data } = await reqGetPermissionList()
      this.list = transListToTreeData(data, '0')
      console.log(this.list)
    },
    clickAdd(type, pid) {
      this.showDialog = true
      this.$refs.addPermission.formData.type = type
      this.$refs.addPermission.formData.pid = pid
    },
    async clickDel(id) {
      this.$confirm('确定要删除该权限吗?', '温馨提示').then(async() => {
        await reqDelPermission(id)
        this.getPermissionList()
        this.$message.success('删除成功')
      }).catch(() => {
        console.log('取消')
      })
    },
    async clickShowEdit(id) {
      // 获取数据回显
      const { data } = await reqGetPermissionDetail(id)
      this.$refs.addPermission.formData = data
      this.showDialog = true
    }
  }
}
</script>
