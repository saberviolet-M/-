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
          <el-dropdown @command="handleCommand">
            <span @click.stop>操作<i class="el-icon-arrow-down" /> </span>
            <!-- 下拉菜单 -->
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="add">添加子部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="edit">编辑部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="del">删除部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { reqDelDepartments } from '@/api/departments'
export default {
  props: {
    // 定义传入的属性
    nodeData: {
      type: Object,
      required: true
    },
    isRoot: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleCommand(type) {
      if (type === 'add') {
        this.$emit('add-depts', this.nodeData) // 将来添加子部门需要
      }
      if (type === 'edit') {
        this.$emit('edit-depts', this.nodeData)
      }
      if (type === 'del') {
        this.$confirm('你确定要删除么?', '温馨提示').then(async() => {
          await reqDelDepartments(this.nodeData.id)
          this.$message.success('删除成功')
          this.$emit('del-depts')
        }).catch(err => {
          console.log(err)
        })
      }
    }
  }
}
</script>
