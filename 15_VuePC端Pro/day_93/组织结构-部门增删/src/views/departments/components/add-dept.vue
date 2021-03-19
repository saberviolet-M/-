<template>
  <!-- 新增部门的弹层 -->
  <el-dialog title="新增部门" :visible="showDialog" @close="handleCloseDialog">
    <!-- 表单组件  el-form   label-width设置label的宽度   -->
    <!-- 匿名插槽 -->
    <el-form ref="deptForm" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="form.name" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="form.code" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select v-model="form.manager" style="width:80%" placeholder="请选择">
          <el-option v-for="item in people" :key="item.id" :value="item.username" :label="item.username" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input v-model="form.introduce" style="width:80%" placeholder="1-300个字符" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
    <div slot="footer">
      <el-button type="primary" size="small" @click="clickSubmit">确定</el-button>
      <el-button size="small">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { reqGetEmployeeSimple } from '@/api/employees'
import { reqAddDepartments } from '@/api/departments'
export default {
  // 需要传入一个props变量来控制 显示或者隐藏
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    nodeData: {
      type: Object,
      required: true
    },
    deptsList: {
      type: Array,
      required: true
    }
  },
  data() {
  // 这个函数的目的是 去找 同级部门下(父id相同) 是否有重复的部门名称
    const checkNameRepeat = (rule, value, callback) => {
    // 过滤得到同级所有部门
      const arr = this.deptsList.filter(item => item.pid === this.nodeData.id)
      // 遍历同级部门, 看有没有重名的
      const flag = arr.some(item => item.name === value)
      // 判断进行校验
      flag ? callback(new Error(`同级部门下已经有${value}的部门了`)) : callback()
    }
    // 校验部门编码是否重复
    const checkCodeRepeat = (rule, value, callback) => {
    // 所有部门, 编码都唯一, 不管层级
      const isRepeat = this.deptsList.some(item => item.code === value)
      isRepeat ? callback(new Error(`已经有编码${value}的部门了`)) : callback()
    }
    return {
      form: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      },
      // 定义校验规则
      rules: {
        name: [
          { required: true, message: '部门名称不能为空', trigger: ['blur', 'change'] },
          { min: 1, max: 50, message: '部门名称要求1-50个字符', trigger: ['blur', 'change'] },
          { validator: checkNameRepeat, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '部门编码不能为空', trigger: ['blur', 'change'] },
          { min: 1, max: 50, message: '部门编码要求1-50个字符', trigger: ['blur', 'change'] },
          { validator: checkCodeRepeat, trigger: 'blur' }
        ],
        manager: [
          { required: true, message: '部门负责人不能为空', trigger: ['blur', 'change'] }
        ],
        introduce: [
          { required: true, message: '部门介绍不能为空', trigger: ['blur', 'change'] },
          { min: 1, max: 300, message: '部门介绍要求1-300个字符', trigger: ['blur', 'change'] }
        ]
      },
      people: []
    }
  },
  created() {
    this.getEmployeeSimple()
  },
  methods: {
    handleCloseDialog() {
      this.$emit('close-dialog', false)
      this.$refs.deptForm.resetFields()
    },
    // 获取员工简单列表数据
    async getEmployeeSimple() {
      const res = await reqGetEmployeeSimple()
      this.people = res.data
      console.log(this.people)
    },
    clickSubmit() {
      this.$refs.deptForm.validate(async isOK => {
        if (isOK) {
        // 调用新增接口 添加父部门的id
          await reqAddDepartments({ ...this.form, pid: this.nodeData.id })
          // 通知到父组件, 添加操作
          this.$emit('add-depts')
          // 关闭弹层
          this.$emit('close-dialog', false)
        }
      })
    }
  }
}
</script>
