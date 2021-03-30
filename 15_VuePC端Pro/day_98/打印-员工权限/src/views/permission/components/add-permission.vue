<template>
  <!-- 新增编辑的弹层 -->
  <el-dialog :visible="showDialog" :title="showTitle" @close="closeDialog">
    <!-- 表单内容 -->
    <el-form label-width="100px">
      <el-form-item label="权限名称">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="权限标识">
        <el-input v-model="formData.code" />
      </el-form-item>
      <el-form-item label="权限描述">
        <el-input v-model="formData.description" />
      </el-form-item>
      <el-form-item label="权限启用">
        <el-switch
          v-model="formData.enVisible"
          active-text="启用"
          active-value="1"
          inactive-text="不启用"
          inactive-value="0"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div style="text-align: right;">
        <el-button @click="$emit('update:showDialog', false)">取消</el-button>
        <el-button type="primary" @click="clickSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { reqAddPermission, reqUpdatePermission } from '@/api/permission'

export default {
  name: 'AddPermission',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        enVisible: '0', // 开启
        name: '', // 名称
        code: '', // 权限标识
        description: '', // 描述
        type: '', // 类型标记了一级(页面访问权) 二级(按钮操作权)
        pid: '' // 添加到哪个节点下
      }
    }
  },
  computed: {
    showTitle() {
      if (this.formData.id) {
        return '查看编辑'
      } else {
        return '添加权限'
      }
    }
  },
  methods: {
    async clickSubmit() {
      if (this.formData.name === '' || this.formData.code === '') {
        this.$message.error('权限名称和权限标识不能为空')
        return
      }
      if (this.formData.id) {
        await reqUpdatePermission(this.formData)
      } else {
        await reqAddPermission(this.formData)
      }
      this.$parent.getPermissionList()
      this.$message.success('操作成功')
      this.$emit('update:showDialog', false)
    },
    closeDialog() {
      this.$emit('update:showDialog', false)
      this.formData = {
        enVisible: '0', // 开启
        name: '', // 名称
        code: '', // 权限标识
        description: '', // 描述
        type: '', // 类型
        pid: '' // 添加到哪个节点下
      }
    }
  }
}
</script>

<style>

</style>
