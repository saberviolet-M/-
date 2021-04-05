<template>
  <div class="upload-box">
    <el-upload
      :on-preview="preview"
      :on-remove="handleRemove"
      :on-change="handleChange"
      :file-list="fileList"
      :limit="limit"
      :class="{disabled: fileComputed }"
      list-type="picture-card"
      action="#"
      :http-request="upload"
      :before-upload="beforeUpload"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <!-- 弹层 -->
    <el-dialog width="600px" top="8vh" title="图片预览" :visible.sync="showDialog">
      <img width="100%" :src="imgUrl" alt="">
    </el-dialog>
    <!-- 进度条组件 -->
    <div v-if="showProgress">
      <div>上传进度：<el-progress style="width: 180px;" :percentage="percent" /></div>
    </div>
  </div>
</template>
<script>
import COS from 'cos-js-sdk-v5' // 导入腾讯云的包(sdk)
export default ({
  name: 'ImageUpload',
  props: {
    limit: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      fileList: [
        { url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' }
      ],
      showDialog: false, // 控制显示弹层
      imgUrl: '',
      showProgress: false,
      percent: 0
    }
  },
  computed: {
  // 设定一个计算属性 判断是否已经上传完了一张
    fileComputed() {
      return this.fileList.length >= this.limit
    },
    // 是否全部上传成功了
    uploadAllSuccess() {
      return this.fileList.every(item => item.status === 'success')
    }
  },
  methods: {
    preview(file) {
      // 这里应该弹出一个层 层里是点击的图片地址
      this.imgUrl = file.url
      this.showDialog = true
    },
    // file 文件,
    // fileList 删除后的文件列表(结构中的)
    // this.fileList 数据中的文件列表
    handleRemove(file, fileList) {
      this.fileList = this.fileList.filter(item => item.uid !== file.uid) // 从data中移出对应项
    },
    // 添加文件, 用户选了就应该新增文件预览
    // 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
    handleChange(file, fileList) {
      // console.log(fileList)
      // console.log(fileList.length)
      this.fileList = [...fileList]
    },
    // 自定义上传动作 有个参数 有个file对象
    upload(params) {
      console.log(params.file)
      if (!params.file) return
      this.showProgress = true
      // 将文件对象, 上传到腾讯云
      // 执行上传操作
      COS.putObject({
        Bucket: 'jepson-75-1256203106', /* 存储桶 */
        Region: 'ap-shanghai', /* 存储桶所在地域，必须字段 */
        Key: params.file.name, /* 文件名 */
        StorageClass: 'STANDARD', // 上传模式, 标准模式
        Body: params.file, // 上传文件对象
        onProgress: progressData => {
          this.percent = parseInt(progressData.percent * 100)
        }
      }, (err, data) => {
        if (err) return console.log(err)
        if (data.statusCode === 200) {
          // console.log('地址:', 'https://' + data.Location)
          // console.log('uid:', params.file.uid)
          // 找到对应的上传的这个file的项
          const fileObj = this.fileList.find(item => item.uid === params.file.uid)
          // 更新状态
          fileObj.status = 'success'
          // 修改地址
          fileObj.url = 'https://' + data.Location
        }
        console.log(data)
        setTimeout(() => {
          this.showProgress = false
          this.percent = 0
        }, 500)
      })
    },
    // 配置上传前的校验, 只要通过校验, 才能进行上传
    beforeUpload(file) {
      // 1. 限制文件类型 file.type
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      if (!types.includes(file.type)) {
        this.$message.error('上传的图片格式, 必须是jpg, gif, bmp, png的格式!')
        return false
      }
      // 2. 限制文件大小 file.size
      if (file.size / 1024 / 1024 >= 5) {
        this.$message.error('上传头像过大, 超过了5M, 必须5M以内')
        return false
      }
      return true
    }
  }
})
</script>

<style lang="scss" scoped>
  .disabled {
    ::v-deep {
      .el-upload--picture-card {
        display: none;
      }
    }
  }
</style>
