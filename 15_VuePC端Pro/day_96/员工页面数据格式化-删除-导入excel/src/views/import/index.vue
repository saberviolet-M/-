<template>
  <div class="import-container">
    <upload-excel :before-upload="beforeUploadFn" :on-success="handleSuccess" />
  </div>
</template>

<script>
import { reqImportEmployee } from '@/api/employees'

export default {
  name: 'Import',
  computed: {
    type() {
      return this.$route.query.type
    }
  },
  methods: {
    // 配置读取, 操作, 之前的校验
    beforeUploadFn(rawFile) {
      // 文件大小的校验
      if (rawFile.size > 20 * 1024 * 1024) {
        this.$message.error('文件过大, 文件大小在20M以内')
        return false
      }
      return true
    },

    // 处理读取文件成功
    async handleSuccess({ header, results }) {
      if (this.type === 'user') {
        // 批量导入用户
        // 基于results数据项, 应该发送提交的ajax请求, 进行数据的录入
        // 存储着中英文的映射关系
        const userRelations = {
          '入职日期': 'timeOfEntry',
          '手机号': 'mobile',
          '姓名': 'username',
          '转正日期': 'correctionTime',
          '工号': 'workNumber'
        }
        const arr = [] // 处理后的数据, 存放的数组
        // 1. 将读取出来的数组中的中文的键名, 换成英文的键名
        // 2. 将读取出来的数组中的时间相关的, 转换成我们需要的日期格式 xx-xx-xx
        results.forEach(item => {
          const userObj = {}
          // 遍历原来的item对象, 处理每个键名
          for (const key in item) {
            if (['timeOfEntry', 'correctionTime'].includes(userRelations[key])) {
            // 入职日期或者转正日期, 需要处理
              userObj[userRelations[key]] = this.formatExcelDate(item[key], '-')
            } else {
              userObj[userRelations[key]] = item[key]
            }
          }
          arr.push(userObj)
        })

        // 处理完数据, 发送请求, 进行批量添加
        console.log(arr)
        await reqImportEmployee(arr)
        this.$message.success('批量导入成功')
        this.$router.back()
      }
    },

    // 专门用于处理excel中读取的日期格式
    // 参数1: 从excel中获取的日期数字
    // 参数2: 分隔字符串
    // 不传分隔符 => 20210128
    // 传了分隔符 => 2021-01-28
    formatExcelDate(numb, format) {
      const time = new Date((numb - 1) * 24 * 3600000 + 1)
      time.setYear(time.getFullYear() - 70)
      const year = time.getFullYear() + ''
      const month = time.getMonth() + 1 + ''
      const date = time.getDate() - 1 + ''
      if (format && format.length === 1) {
        return year + format + (month < 10 ? '0' + month : month) + format + (date < 10 ? '0' + date : date)
      }
      return year + (month < 10 ? '0' + month : month) + (date < 10 ? '0' + date : date)
    }
  }
}
</script>

<style>

</style>
