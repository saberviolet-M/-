<template>
  <div class="departments-container">
    <div class="app-container">
      <el-card class="tree-card">
        <!-- 用了一个行列布局 -->
        <tree-tools :node-data="company" :is-root="true" />

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
