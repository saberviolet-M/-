<template>
  <el-dialog class="assign-role" title="分配角色" :visible="showRoleDialog" @open="dialogOpen" @close="closeDialog">
    <!-- el-checkbox-group选中的是 当前用户所拥有的角色  需要绑定 当前用户拥有的角色-->
    <el-checkbox-group v-model="roleIds" v-loading="loading">
      <el-checkbox v-for="item in list" :key="item.id" :label="item.id">
        {{ item.name }}
      </el-checkbox>
    </el-checkbox-group>

    <template #footer>
      <div style="text-align: right">
        <el-button type="primary" @click="clickSubmit">确定</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { reqGetRoleList } from '@/api/setting'
import { reqGetUserDetailById } from '@/api/user'
import { reqAssignRoles } from '@/api/employees'
export default {
  props: {
    showRoleDialog: {
      type: Boolean,
      default: false
    },
    // 用户的id 用来查询当前用户的角色信息
    userId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      list: [],
      roleIds: [],
      loading: false
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    closeDialog() {
      this.$emit('update:showRoleDialog', false)
    },
    async getRoleList() {
      const { data } = await reqGetRoleList(1, 100)
      this.list = data.rows
    },
    async getUserDetailById() {
      const { data } = await reqGetUserDetailById(this.userId)
      this.roleIds = data.roleIds
    },
    dialogOpen() {
      this.loading = true
      Promise.all([this.getRoleList(), this.getUserDetailById()]).then(() => {
        this.loading = false
      })
    },
    async clickSubmit() {
      await reqAssignRoles({
        id: this.userId,
        roleIds: this.roleIds
      })
      this.closeDialog()
    }
  }
}
</script>

<style lang="scss" scoped>
.assign-role {
  ::v-deep {
    .el-checkbox {
      font-size: 30px;
    }
  }
}
</style>
