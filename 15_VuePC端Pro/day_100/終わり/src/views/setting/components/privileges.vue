<template>
  <!-- 分配权限的弹层 -->
  <el-dialog
    title="分配权限"
    :visible="showAssignDialog"
    @close="closeAssignDialog"
    @open="openAssignDialog"
  >
    <el-tree
      ref="tree"
      v-loading="treeLoading"
      :data="permissionData"
      :props="{ label: 'name' }"
      :default-expand-all="true"
      :show-checkbox="true"
      :check-strictly="true"
      node-key="id"
    />
    <template #footer>
      <div style="text-align: right;">
        <el-button @click="closeAssignDialog">取消</el-button>
        <el-button type="primary" @click.native="clickAssign">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { reqGetPermissionList } from '@/api/permission'
import { transListToTreeData } from '@/utils'
import { reqGetRoleDetail, reqAssignPerm } from '@/api/setting'
export default {
  name: 'Privileges',
  props: {
    showAssignDialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      roleId: null,
      permissionData: [], // 存储权限数据
      treeLoading: false
    }
  },
  methods: {
    closeAssignDialog() {
      this.$emit('update:showAssignDialog', false)
    },
    async openAssignDialog() {
      this.treeLoading = true
      // 发送请求, 获取权限列表
      const { data: permissionData } = await reqGetPermissionList()
      this.permissionData = transListToTreeData(permissionData, '0')
      // 发送请求, 获取已有权限
      const { data: roleDetail } = await reqGetRoleDetail(this.roleId)
      this.$refs.tree.setCheckedKeys(roleDetail.permIds)
      this.treeLoading = false
    },
    // 分配权限
    async clickAssign() {
      await reqAssignPerm({
        id: this.roleId,
        permIds: this.$refs.tree.getCheckedKeys()
      })
      this.$message.success('分配成功')
      this.$emit('update:showAssignDialog', false)
    }
  }
}
</script>

<style>

</style>
