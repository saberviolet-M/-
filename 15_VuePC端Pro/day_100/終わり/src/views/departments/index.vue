<template>
  <div class="departments-container">
    <div class="app-container">
      <el-card v-loading="loading" class="tree-card">
        <!-- 头部 -->
        <tree-tools
          :node-data="company"
          :is-root="true"
          @add-depts="handleAddDepts"
        />

        <!-- 放置一个el-tree组件 -->
        <el-tree
          :data="departs"
          :props="defaultProps"
          :default-expand-all="true"
        >
          <!-- 用了一个行列布局 -->
          <template #default="{ data }">
            <tree-tools
              :node-data="data"
              @del-depts="getDepartments"
              @add-depts="handleAddDepts"
              @edit-depts="handleEditDepts"
            />
          </template>
        </el-tree>
      </el-card>
      <add-dept
        ref="addDioalig"
        :show-dialog.sync="showDialog"
        :node-data="nodeData"
        :depts-list="deptsList"
        @add-depts="getDepartments"
      />
    </div>
  </div>
</template>

<script>
import treeTools from './components/tree-tools.vue'
import AddDept from './components/add-dept.vue'
import { reqGetDepartments } from '@/api/departments'
import { transListToTreeData } from '@/utils/index'
export default {
  name: 'Departments',
  components: { treeTools, AddDept },
  data() {
    return {
      departs: [],
      defaultProps: {
        label: 'name',
        children: 'children'
      },
      company: {},
      showDialog: false,
      nodeData: {},
      deptsList: [],
      loading: false
    }
  },
  created() {
    this.getDepartments()
  },
  methods: {
    async getDepartments() {
      this.loading = true
      const {
        data: { companyName, depts }
      } = await reqGetDepartments()
      this.company = {
        name: companyName,
        manager: '负责人',
        id: ''
      }
      this.departs = transListToTreeData(depts, '')
      this.deptsList = depts
      this.loading = false
    },
    handleAddDepts(nodeData) {
      // 显示弹层
      this.showDialog = true
      // 存储传过来的数据, 这个应该记录下来, 将来添加需要用到
      this.nodeData = nodeData
    },
    handleEditDepts(nodeData) {
      this.showDialog = true
      this.nodeData = nodeData
      this.$refs.addDioalig.getDepartDetail(nodeData.id)
    }
  }
}
</script>

<style lang='scss' scoped>
.tree-card {
  padding: 30px 30px;
  font-size: 14px;
}
.el-tree {
  ::v-deep {
    .el-tree-node__expand-icon.expanded {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    .el-icon-caret-right:before {
      background: url('~@/assets/common/add-circle.png') no-repeat 0 0;
      content: '';
      display: block;
      width: 16px;
      height: 16px;
      font-size: 16px;
      background-size: 16px;
    }
    .el-tree-node__expand-icon.expanded.el-icon-caret-right:before {
      background: url('~@/assets/common/minus-circle.png') no-repeat 0 0;
      content: '';
      display: block;
      width: 16px;
      height: 16px;
      font-size: 16px;
      background-size: 16px;
    }
    .el-tree-node__expand-icon.is-leaf::before {
      background: url('~@/assets/common/user-filling.png') no-repeat 0 0;
      content: '';
      display: block;
      width: 16px;
      height: 16px;
      font-size: 16px;
      background-size: 16px;
    }
  }
}
</style>
