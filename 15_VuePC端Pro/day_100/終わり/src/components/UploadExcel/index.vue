<template>
  <div class="upload-excel">
    <!-- 左侧按钮 -->
    <div class="btn-upload">
      <el-button :loading="loading" size="mini" type="primary" @click="handleUpload">
        点击上传
      </el-button>
    </div>

    <!-- 文件选择框 -->
    <!-- accept=".xlsx, .xls", h5新增的属性, 表示可以接收的文件后缀格式, 只能选择excel的文件 -->
    <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">

    <!-- 右侧拖拽区域 -->
    <div class="drop" @drop="handleDrop" @dragover="handleDragover" @dragenter="handleDragover">
      <i class="el-icon-upload" />
      <span>将文件拖到此处</span>
    </div>
  </div>
</template>

<script>
// 1. 点击按钮
// 2. 触发了file的click, 弹出了选择框
// 3. 用户选择文件, 触发了change
// 4. 在change事件中, 拿到选择的文件对象, 考虑进行处理
// 5. 判断有没有传递校验函数 beforeUpload, 传递了就用它校验一下
// 6. 校验通过, 才开始读文件, fileReader 读文件, 读出buffer字节流的数据, 使用插件XLSX解析
// 7. 解析得到数据, 调用传递的 onSuccess 函数

import XLSX from 'xlsx' // 解析excel的插件
export default {
  name: 'UploadExcel',
  props: {
    // 父传子配置的校验函数
    beforeUpload: Function, // eslint-disable-line
    // 父传子配置的成功函数
    onSuccess: Function// eslint-disable-line
  },
  data() {
    return {
      loading: false,
      excelData: {
        header: null,
        results: null
      }
    }
  },
  methods: {
    generateData({ header, results }) {
      this.excelData.header = header
      this.excelData.results = results
      this.onSuccess && this.onSuccess(this.excelData)
    },
    handleDrop(e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.loading) return
      const files = e.dataTransfer.files
      if (files.length !== 1) {
        this.$message.error('Only support uploading one file!')
        return
      }
      const rawFile = files[0] // only use files[0]
      if (!this.isExcel(rawFile)) {
        this.$message.error('Only supports upload .xlsx, .xls, .csv suffix files')
        return false
      }
      this.upload(rawFile)
      e.stopPropagation()
      e.preventDefault()
    },
    handleDragover(e) {
      e.stopPropagation()
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    handleUpload() {
      this.$refs['excel-upload-input'].click()
    },
    // 用户选择了excel文件 (change事件)
    handleClick(e) {
      const files = e.target.files
      const rawFile = files[0] // 通过files[0]拿到选择的那个excel文件
      if (!rawFile) return
      // 拿到原始文件对象
      this.upload(rawFile)
    },
    upload(rawFile) {
      // 拿到了选择的文件对象后, 清空了原有的file框的内容
      this.$refs['excel-upload-input'].value = null // fix can't select the same excel

      // 看父传子有没传递beforeUpload函数
      if (!this.beforeUpload) {
        // 就开始读 excel 了
        this.readerData(rawFile)
        return
      }

      // beforeUpload会要求你返回一个布尔值,
      // true意味着通过了校验
      // false意味着没通过校验, 没通过校验, 不会开始读excel
      const before = this.beforeUpload(rawFile)
      if (before) {
        // 就开始读 excel 了
        this.readerData(rawFile)
      }
    },

    // 开始读excel
    readerData(rawFile) {
      this.loading = true
      return new Promise((resolve, reject) => {
        // h5中新增的, 读取文件的api, fileReader
        const reader = new FileReader()

        // 读文件需要时间, onload触发时, 才是文件读完的时候
        reader.onload = e => {
          const data = e.target.result
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const header = this.getHeaderRow(worksheet)
          const results = XLSX.utils.sheet_to_json(worksheet)
          this.generateData({ header, results })
          this.loading = false // 关闭加载状态, 读完了

          resolve()
        }
        reader.readAsArrayBuffer(rawFile)
      })
    },
    getHeaderRow(sheet) {
      const headers = []
      const range = XLSX.utils.decode_range(sheet['!ref'])
      let C
      const R = range.s.r
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
        /* find the cell in the first row */
        let hdr = 'UNKNOWN ' + C // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
        headers.push(hdr)
      }
      return headers
    },
    isExcel(file) {
      return /\.(xlsx|xls|csv)$/.test(file.name)
    }
  }
}
</script>

<style scoped lang="scss">
.upload-excel {
  display: flex;
  justify-content: center;
  margin-top: 100px;
  .excel-upload-input {
    display: none;
    z-index: -9999;
  }
  .btn-upload,
  .drop {
    border: 1px dashed #bbb;
    width: 350px;
    height: 160px;
    text-align: center;
    line-height: 160px;
  }
  .drop {
    padding-top: 20px;
    line-height: 80px;
    color: #bbb;
    i {
      font-size: 60px;
      display: block;
    }
  }
}
</style>
