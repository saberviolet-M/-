<template>
  <el-dialog :title="showTitle" :visible="dialogFormVisible" @close="closeDialog">
    <el-form ref="roleForm" :model="form" :rules="rules">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input v-model="form.description" autocomplete="off" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="handleConfirmBtn">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { reqAddRole, reqUpdateRoleById } from '@/api/setting'
export default {
  name: 'Role',
  props: {
    dialogFormVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rules: {
        name: [
          { required: true, message: '请输入角色姓名', trigger: ['blur', 'change'] }
        ]
      },
      form: {
        name: '',
        description: '',
        id: ''
      }
    }
  },
  computed: {
    showTitle() {
      return this.form.id ? '编辑角色' : '添加角色'
    }
  },
  methods: {
    resetForm() {
      // 重置表单内容的校验状态
      this.$refs.roleForm.resetFields()
      this.form = {
        name: '',
        description: '',
        id: ''
      }
    },
    closeDialog() {
      this.$emit('update:dialogFormVisible', false)
      this.resetForm()
    },
    handleConfirmBtn() {
      this.$refs.roleForm.validate(
        async flag => {
          if (!flag) return
          if (this.form.id) {
            await reqUpdateRoleById(this.form)
            this.$message.success('修改成功')
          } else {
            await reqAddRole(this.form)
            this.$message.success('添加成功')
          }
          this.closeDialog()
          this.$emit('reload')
          this.resetForm()
        }
      )
    }
  }
}
</script>
