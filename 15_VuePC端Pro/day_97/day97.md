# day97

### excel导入 -- 接口封装

- `src/api/employees.js`

  ```js
  /** *
   * 封装一个批量导入员工的接口
   * data: [{}, {}, {}, {}, ... ]
   * ***/
  export function reqImportEmployee(data) {
    return request({
      url: '/sys/user/batch',
      method: 'post',
      data
    })
  }
  ```

- `src/views/import/index.vue`

  ```jsx
  <template>
    <div class="import-container">
      <upload-excel :before-upload="beforeUploadFn" :on-success="handleSuccess" />
    </div>
  </template>
  
  import { reqImportEmployee } from '@/api/employees'
  
  // 从url中获取跳转来的页面信息
  computed: {
    type() {
      return this.$route.query.type
    }
  },
  
  methods: {
    // 处理读取文件成功
    async handleSuccess({ header, results }) {
      // 是从'user'界面来的  
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
        // 跳回原页面
        this.$router.back()
      }
    }
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
  ```

### 员工导出excel功能

> Excel 的导入导出都依赖于[js-xlsx](https://github.com/SheetJS/js-xlsx)来实现
>
> 在 `js-xlsx`的基础上又封装了[Export2Excel.js](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/vendor/Export2Excel.js)来方便导出数据

#### 安装excel所需依赖和按需加载

```bash
yarn add xlsx file-saver script-loader
```

- `src/views/employees/index.vue`

  ```jsx
  <el-button
    type="danger"
    size="small"
    @click="clickExport"
  >
    excel导出
  </el-button>
  ```

- excel导出参数

  | 参数      | 说明                   | 类型    | 可选值                                                       | 默认值     |
  | --------- | ---------------------- | ------- | ------------------------------------------------------------ | ---------- |
  | header    | 导出数据的表头         | Array   | /                                                            | []         |
  | data      | 导出的具体数据         | Array   | /                                                            | [[],  []]  |
  | filename  | 导出文件名             | String  | /                                                            | excel-list |
  | autoWidth | 单元格是否要自适应宽度 | Boolean | true / false                                                 | true       |
  | bookType  | 导出文件类型           | String  | xlsx, csv, txt, [more](https://github.com/SheetJS/js-xlsx#supported-output-formats) | xlsx       |

  ```jsx
  async clickExport() {
    // 请注意: 如果导出的是当前页, 那么数据, this.list 即可,
    // 一般导出的是全部的数据, 需要请求到所有的数据
    const { data: { rows }} = await reqGetEmployeeList(1, this.total)
    const headersArr = ['姓名', '手机号', '入职日期', '聘用形式', '转正日期', '工号', '部门']
    const multiHeader = [['姓名', '主要信息', '', '', '', '', '部门']]
    const headersRelations = {
      '姓名': 'username',
      '手机号': 'mobile',
      '入职日期': 'timeOfEntry',
      '聘用形式': 'formOfEmployment',
      '转正日期': 'correctionTime',
      '工号': 'workNumber',
      '部门': 'departmentName'
    }
    const dataArr = this.formatJson(rows, headersArr, headersRelations)
    const merges = ['A1:A2', 'B1:F1', 'G1:G2']
    
    // 作为不常使用的功能采用懒加载方式
    import('@/vendor/Export2Excel').then(excel => {
      excel.export_json_to_excel({
        header: headersArr, // 表格的头部
        // 二维数组 [ [], [], [] ]
        data: dataArr,
        filename: '学生信息表', // 导出的excel文件名
        autoWidth: true, // 是否开启单元格宽度自适应
        bookType: 'xlsx', // 类型
        multiHeader,
        merges
      })
    })
  },
  ```

- 导出时间和聘用形式的格式处理

  ```jsx
  formatJson(rows, headersArr, headersRelations) {
    // [
    //   [ 值1, 值2, 值3, ... ]
    // ]
    const resultsArr = rows.map((item) => {
      const arr = []
      headersArr.forEach(key => {
        const englishKey = headersRelations[key]
        let value = item[englishKey]
        if (['timeOfEntry', 'correctionTime'].includes(englishKey)) {
          value = formatDate(value)
        }
        if (englishKey === 'formOfEmployment') {
          const obj = EmployeeEnum.hireType.find(obj => obj.id === value)
          value = obj ? obj.value : '未知'
        }
        arr.push(value)
      })
      return arr
    })
    return resultsArr
  }
  ```

## 员工详情页创建和布局

- 建立详情页路由 `router/modules/employees.js`

  ```js
  import Layout from '@/layout'
  
  export default {
    path: '/employees',
    component: Layout,
    children: [
      ...
      {
        path: 'detail/:id', // 动态路由参数
        component: () => import('@/views/employees/components/detail'),
        hidden: true,
        meta: {
          title: '员工详情'
        }
      }
    ]
  }
  ```

- `src/views/employees/index.vue`

  ```jsx
  <el-button type="text" size="small" @click="$router.push(`/employees/detail/${row.id}`)">查看</el-button>
  
  ```

- `src/views/employees/components/detail.vue`（结构）

  ```jsx
  <template>
    <div class="employees-detail-container">
      <div class="app-container">
        <el-card>
          <el-tabs>
            <el-tab-pane label="登录账号设置">
              <!-- 放置表单 -->
              <el-form ref="userForm" :model="userInfo" :rules="rules" label-width="120px" style="margin-left: 120px; margin-top:30px">
                <el-form-item prop="username" label="姓名:">
                  <el-input v-model="userInfo.username" placeholder="请输入姓名" style="width:300px" />
                </el-form-item>
                <el-form-item prop="newPassword" label="新密码:">
                  <el-input v-model="userInfo.newPassword" placeholder="请输入新密码" style="width:300px" type="password" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveUser">更新</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="个人详情">
              <!-- 内容 -->
              <user-info />
            </el-tab-pane>
            <el-tab-pane label="岗位信息">
              <!-- 内容 -->
              <job-info />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </div>
  </template>
  ```

- 发送请求 - 绑定数据

  > 接口中读取的是后端的密文，所以不回显原密码
  >
  > 设定一个临时的字段 **newPassword**，用它来存储修改值，最后保存的时候，提交**newPassword** 

  ```js
  import { reqGetUserDetailById } from '@/api/user'
  export default {
    name: 'EmployeesDetail',
    data() {
      return {
        userInfo: {
          username: '',
          newPassword: ''
        },
        rules: {
          username: [
            { required: true, message: '姓名不能为空', trigger: ['blur', 'change'] }
          ],
          newPassword: [
            { min: 6, max: 9, message: '密码必须是6-9位', trigger: ['blur', 'change'] }
          ]
        }
      }
    },
    computed: {
      userId() {
        return this.$route.params.id
      }
    },
    async created() {
      const { data } = await reqGetUserDetailById(this.userId)
      this.userInfo = data
    }
  }
  ```

### 更新用户名密码

- 封装接口`src/api/employees.js`

  ```js
  /** *
   * 保存员工的基本信息
   * **/
  export function reqSaveUserDetailById(data) {
    return request({
      method: 'put',
      url: `/sys/user/${data.id}`,
      data
    })
  }
  ```

-  `src/views/employees/detail.vue`

  ```jsx
  <el-button type="primary" @click="saveUser">更新</el-button>
  
  import { reqSaveUserDetailById } from '@/api/employees'
  
  methods: {
    saveUser() {
      this.$refs.userForm.validate(async(flag) => {
        if (!flag) return
        // 校验通过
        await reqSaveUserDetailById({
          ...this.userInfo,
          password: this.userInfo.newPassword
        })
        this.$message.success('保存成功')
      })
    }
  }
  ```

### 个人组件和岗位组件封装

- 封装个人组件   `src/views/employees/components/user-info.vue`（结构）

  ```jsx
  <template>
    <div class="user-info">
      <!-- 个人信息 -->
      <el-form label-width="220px">
        <!-- 工号 入职时间 -->
        <el-row class="inline-info">
          <el-col :span="12">
            <el-form-item label="工号">
              <el-input v-model="userInfo.workNumber" class="inputW" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职时间">
              <el-date-picker
                v-model="userInfo.timeOfEntry"
                type="date"
                class="inputW"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 姓名 部门 -->
        <el-row class="inline-info">
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="userInfo.username" class="inputW" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门">
              <el-input v-model="userInfo.departmentName" class="inputW" />
            </el-form-item>
          </el-col>
        </el-row>
        <!--手机 聘用形式  -->
        <el-row class="inline-info">
          <el-col :span="12">
            <el-form-item label="手机">
              <el-input v-model="userInfo.mobile" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="聘用形式">
              <el-select v-model="userInfo.formOfEmployment" class="inputW">
                <el-option
                  v-for="item in EmployeeEnum.hireType"
                  :key="item.id"
                  :label="item.value"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 员工照片 -->
        <el-row class="inline-info">
          <el-col :span="12">
            <el-form-item label="员工头像">
              <!-- 放置上传图片 -->
  
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 保存个人信息 -->
        <el-row class="inline-info" type="flex" justify="center">
          <el-col :span="12">
            <el-button type="primary" @click="saveUser">保存更新</el-button>
            <el-button @click="$router.back()">返回</el-button>
  
          </el-col>
        </el-row>
      </el-form>
      <!-- 基础信息 -->
      <el-form label-width="220px">
        <div class="block">
          <div class="title">基础信息</div>
          <el-form-item label="最高学历">
            <el-select v-model="formData.theHighestDegreeOfEducation" class="inputW2">
              <el-option
                v-for="item in EmployeeEnum.highestDegree"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <!-- 个人头像 -->
          <!-- 员工照片 -->
  
          <el-form-item label="员工照片">
            <!-- 放置上传图片 -->
          </el-form-item>
          <el-form-item label="国家/地区">
            <el-select v-model="formData.nationalArea" class="inputW2">
              <el-option
                v-for="item in EmployeeEnum.isOverseas"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="护照号">
            <el-input v-model="formData.passportNo" placeholder="正规护照格式" class="inputW" />
          </el-form-item>
          <el-form-item label="身份证号">
            <el-input v-model="formData.idNumber" placeholder="正规身份证格式" class="inputW" />
          </el-form-item>
          <el-form-item label="籍贯">
            <el-input v-model="formData.nativePlace" placeholder="籍贯地址" class="inputW5" />
          </el-form-item>
          <el-form-item label="民族">
            <el-input v-model="formData.nation" placeholder="请输入民族" class="inputW2" />
          </el-form-item>
          <el-form-item label="婚姻状况">
            <el-select v-model="formData.maritalStatus" class="inputW2">
              <el-option
                v-for="item in EmployeeEnum.maritaStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="生日">
            <el-input v-model="formData.birthday" placeholder="示例 0323" class="inputW" />
          </el-form-item>
          <el-form-item label="年龄">
            <el-input v-model="formData.age" type="number" class="inputW2" />
          </el-form-item>
          <el-form-item label="星座">
            <el-select v-model="formData.constellation" class="inputW2">
              <el-option
                v-for="item in EmployeeEnum.constellation"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="血型">
            <el-select v-model="formData.bloodType" class="inputW2">
              <el-option
                v-for="item in EmployeeEnum.bloodType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="户籍所在地">
            <el-input v-model="formData.domicile" class="inputW5" />
          </el-form-item>
          <el-form-item label="政治面貌">
            <el-input v-model="formData.politicalOutlook" class="inputW2" />
          </el-form-item>
          <el-form-item label="入党时间">
            <el-date-picker
              v-model="formData.timeToJoinTheParty"
              type="date"
              placeholder="选择日期"
              class="inputW"
            />
          </el-form-item>
          <el-form-item label="存档机构">
            <el-input v-model="formData.archivingOrganization" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="子女状态">
            <el-input v-model="formData.stateOfChildren" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="子女有无商业险">
            <el-radio-group v-model="formData.doChildrenHaveCommercialInsurance">
              <el-radio label="1">有</el-radio>
              <el-radio label="2">无</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="有无违法违纪状态">
            <el-input v-model="formData.isThereAnyViolationOfLawOrDiscipline" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="有无重大病史">
            <el-input v-model="formData.areThereAnyMajorMedicalHistories" placeholder="请输入" />
          </el-form-item>
        </div>
        <!-- 通讯信息 -->
        <div class="block">
          <div class="title">通讯信息</div>
          <el-form-item label="QQ">
            <el-input v-model="formData.qq" placeholder="请输入" class="inputW" />
          </el-form-item>
          <el-form-item label="微信">
            <el-input v-model="formData.wechat" placeholder="请输入" class="inputW" />
          </el-form-item>
          <el-form-item label="现居住地">
            <el-input v-model="formData.placeOfResidence" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="通讯地址">
            <el-input v-model="formData.postalAddress" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="联系手机">
            <el-input v-model="formData.contactTheMobilePhone" placeholder="11位字符" maxlength="11" class="inputW" @change.native="handlePhone(2)" />
          </el-form-item>
          <el-form-item label="个人邮箱">
            <el-input v-model="formData.personalMailbox" placeholder="请输入" type="mail" class="inputW" />
          </el-form-item>
          <el-form-item label="紧急联系人">
            <el-input v-model="formData.emergencyContact" placeholder="请输入" class="inputW" />
          </el-form-item>
          <el-form-item label="紧急联系电话">
            <el-input v-model="formData.emergencyContactNumber" placeholder="11位字符" class="inputW" />
          </el-form-item>
        </div>
        <!-- 账号信息 -->
        <div class="block">
          <div class="title">账号信息</div>
          <el-form-item label="社保电脑号">
            <el-input v-model="formData.socialSecurityComputerNumber" placeholder="请输入" class="inputW" />
          </el-form-item>
          <el-form-item label="公积金账号">
            <el-input v-model="formData.providentFundAccount" placeholder="请输入" class="inputW" />
          </el-form-item>
          <el-form-item label="银行卡号">
            <el-input v-model="formData.bankCardNumber" placeholder="请输入" class="inputW" />
          </el-form-item>
          <el-form-item label="开户行">
            <el-input v-model="formData.openingBank" placeholder="请输入" class="inputW" />
          </el-form-item>
        </div>
        <!-- 教育信息 -->
        <div class="block">
          <div class="title">教育信息</div>
          <el-form-item label="学历类型">
            <el-select v-model="formData.educationalType" placeholder="请选择">
              <el-option
                v-for="item in EmployeeEnum.educationType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="毕业学校">
            <el-input v-model="formData.graduateSchool" placeholder="请输入" class="inputW2" />
          </el-form-item>
          <el-form-item label="入学时间">
            <el-date-picker v-model="formData.enrolmentTime" type="data" placeholder="请输入时间" class="inputW" />
          </el-form-item>
          <el-form-item label="毕业时间">
            <el-date-picker v-model="formData.graduationTime" type="data" placeholder="请输入时间" class="inputW" />
          </el-form-item>
          <el-form-item label="专业">
            <el-input v-model="formData.major" placeholder="请输入" class="inputW" />
          </el-form-item>
        </div>
        <!-- 从业信息 -->
        <div class="block">
          <div class="title">从业信息</div>
          <el-form-item label="上家公司">
            <el-input v-model="formData.homeCompany" placeholder="请输入" class="inputW" />
          </el-form-item>
          <el-form-item label="职称">
            <el-input v-model="formData.title" placeholder="请输入" class="inputW" />
          </el-form-item>
          <el-form-item label="有无竞业限制">
            <el-input v-model="formData.isThereAnyCompetitionRestriction" placeholder="请输入" style="width:80%" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="formData.remarks" type="textarea" placeholder="请输入备注" style="width:80%" />
          </el-form-item>
          <!-- 保存员工信息 -->
          <el-row class="inline-info" type="flex" justify="center">
            <el-col :span="12">
              <el-button type="primary" @click="savePersonal">保存更新</el-button>
              <el-button @click="$router.back()">返回</el-button>
            </el-col>
          </el-row>
        </div>
      </el-form>
  
    </div>
  
  </template>
  ```

- 定义`user-info`的数据

  ```jsx
  <script>
  import EmployeeEnum from '@/api/constant/employees'
  
  export default {
    data() {
      return {
        EmployeeEnum, // 员工枚举数据
        userInfo: {
          workNumber: '', // 工号
          timeOfEntry: '', // 入职时间
          username: '', // 姓名
          departmentName: '', // 部门
          mobile: '', // 手机
          formOfEmployment: '' // 聘用形式
        },
        formData: {
          userId: '',
          username: '', // 用户名
          sex: '', // 性别
          mobile: '', // 手机
          companyId: '', // 公司id
          departmentName: '', // 部门名称
          //  onTheJobStatus: '', // 在职状态 no
          dateOfBirth: '', // 出生日期
          timeOfEntry: '', // 入职时间
          theHighestDegreeOfEducation: '', // 最高学历
          nationalArea: '', // 国家
          passportNo: '', // 护照号
          idNumber: '', // 身份证号
          idCardPhotoPositive: '', // 身份证照正
          idCardPhotoBack: '', // 身份证照正
          nativePlace: '', // 籍贯
          nation: '', // 民族
          englishName: '', // 英文名字
          maritalStatus: '', // 婚姻状况
          staffPhoto: '', // 员工照片
          birthday: '', // 生日
          zodiac: '', // 属相
          age: '', // 年龄
          constellation: '', // 星座
          bloodType: '', // 血型
          domicile: '', // 户籍所在地
          politicalOutlook: '', // 政治面貌
          timeToJoinTheParty: '', // 入党时间
          archivingOrganization: '', // 存档机构
          stateOfChildren: '', // 子女状态
          doChildrenHaveCommercialInsurance: '1', // 保险状态
          isThereAnyViolationOfLawOrDiscipline: '', // 违法违纪状态
          areThereAnyMajorMedicalHistories: '', // 重大病史
          qq: '', // QQ
          wechat: '', // 微信
          residenceCardCity: '', // 居住证城市
          dateOfResidencePermit: '', // 居住证办理日期
          residencePermitDeadline: '', // 居住证截止日期
          placeOfResidence: '', // 现居住地
          postalAddress: '', // 通讯地址
          contactTheMobilePhone: '', // 联系手机
          personalMailbox: '', // 个人邮箱
          emergencyContact: '', // 紧急联系人
          emergencyContactNumber: '', // 紧急联系电话
          socialSecurityComputerNumber: '', // 社保电脑号
          providentFundAccount: '', // 公积金账号
          bankCardNumber: '', // 银行卡号
          openingBank: '', // 开户行
          educationalType: '', // 学历类型
          graduateSchool: '', // 毕业学校
          enrolmentTime: '', // 入学时间
          graduationTime: '', // 毕业时间
          major: '', // 专业
          graduationCertificate: '', // 毕业证书
          certificateOfAcademicDegree: '', // 学位证书
          homeCompany: '', // 上家公司
          title: '', // 职称
          resume: '', // 简历
          isThereAnyCompetitionRestriction: '', // 有无竞业限制
          proofOfDepartureOfFormerCompany: '', // 前公司离职证明
          remarks: '' // 备注
        }
      }
    },
    computed: {
      userId() {
        return this.$route.params.id
      }
    },
    methods: {
      saveUser() {
  
      },
      savePersonal() {
  
      }
    }
  }
  </script>
  ```

- 封装岗位组件  `src/views/employee/components/job-info.vue`（结构）

  ```jsx
  <template>
    <div class="job-info">
      <!-- 基础信息 -->
      <el-form label-width="220px">
        <div class="block">
          <div class="title">基础信息</div>
          <el-form-item label="岗位">
            <el-input v-model="formData.post" placeholder="请输入" class="inputW" />
          </el-form-item>
          <!-- <el-form-item label="转正日期">
            <el-date-picker
              v-model="formData.dateOfCorrection"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item> -->
          <el-form-item label="转正状态">
            <el-select v-model="formData.stateOfCorrection" placeholder="请选择" disabled>
              <el-option
                v-for="item in EmployeeEnum.stateOfCorrection"
                :key="item.value"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="职级">
            <el-input v-model="formData.rank" class="inputW" />
          </el-form-item>
          <el-form-item label="转正评价">
            <el-input v-model="formData.correctionEvaluation" type="textarea" placeholder="1-300位字符" />
          </el-form-item>
          <el-form-item label="汇报对象">
            <el-select v-model="formData.reportId" filterable placeholder="请选择" class="inputW">
              <el-option v-for="item in list" :key="item.id" :label="item.username" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="HRBP">
            <el-select v-model="formData.hrbp" filterable placeholder="请选择" class="inputW">
              <el-option v-for="item in list" :key="item.id" :label="item.username" :value="item.id" class="inputW" />
            </el-select>
          </el-form-item>
          <el-form-item class="formInfo" label="调整司龄(天)：">
            <el-input v-model="formData.adjustmentAgedays" type="number" placeholder="请输入" class="inputW" />
          </el-form-item>
          <el-form-item label="首次参加工作时间">
            <el-date-picker
              v-model="formData.workingTimeForTheFirstTime"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="调整工龄">
            <el-input v-model="formData.adjustmentOfLengthOfService" placeholder="0.00年" class="inputW" disabled />
          </el-form-item>
        </div>
        <!-- 合同信息 -->
        <div class="block">
          <div class="title">合同信息</div>
          <el-form-item class="formInfo" label="首次合同开始时间：">
            <el-date-picker
              v-model="formData.initialContractStartTime"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="首次合同结束时间">
            <el-date-picker
              v-model="formData.firstContractTerminationTime"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="现合同开始时间">
            <el-date-picker
              v-model="formData.currentContractStartTime"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="现合同结束时间">
            <el-date-picker
              v-model="formData.closingTimeOfCurrentContract	"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="合同期限">
            <el-select v-model="formData.contractPeriod" class="filter-item">
              <el-option
                v-for="item in EmployeeEnum.contractPeriod"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="续签次数">
            <el-select v-model="formData.renewalNumber" class="filter-item">
              <el-option
                v-for="item in EmployeeEnum.renewalCount"
                :key="item.id"
                :label="item.value"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <!-- 招聘信息 -->
        <div class="block">
          <div class="title">招聘信息</div>
          <el-form-item label="其他招聘渠道">
            <el-select v-model="formData.otherRecruitmentChannels" placeholder="请选择">
              <el-option
                v-for="item in EmployeeEnum.resumeSource"
                :key="item.id"
                :label="item.value"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="招聘渠道">
            <el-select v-model="formData.recruitmentChannels" placeholder="请选择">
              <el-option
                v-for="item in EmployeeEnum.resumeSource"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="社招/校招">
            <el-select v-model="formData.socialRecruitment" placeholder="请选择">
              <el-option
                v-for="item in EmployeeEnum.hireSourceType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="推荐企业/人">
            <el-input v-model="formData.recommenderBusinessPeople" placeholder="请输入" class="infoPosition inputW" />
          </el-form-item>
        </div>
        <!-- 从业信息 -->
        <el-form-item>
          <el-button type="primary" @click="saveJob">保存更新</el-button>
          <el-button @click="$router.back()">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  
  </template>
  ```

- 定义岗位数据

  ```jsx
  <script>
  import EmployeeEnum from '@/api/constant/employees'
  
  export default {
    data() {
      return {
        list: [],
        EmployeeEnum,
        formData: {
          adjustmentAgedays: '', // 调整司龄天
          adjustmentOfLengthOfService: '', // 调整工龄天
          closingTimeOfCurrentContract: '', // 现合同结束时间
          companyId: '', // 公司ID
          contractDocuments: '', // 合同文件
          contractPeriod: '', // 合同期限
          correctionEvaluation: '', //  转正评价
          currentContractStartTime: '', // 现合同开始时间
          firstContractTerminationTime: '', // 首次合同结束时间
          hrbp: '', // HRBP
          initialContractStartTime: '', // 首次合同开始时间
          otherRecruitmentChannels: '', // 其他招聘渠道
          post: '', // 岗位
          rank: null, // 职级
          recommenderBusinessPeople: '', // 推荐企业人
          recruitmentChannels: '', // 招聘渠道
          renewalNumber: '', // 续签次数
          reportId: '', // 汇报对象
          reportName: null, // 汇报对象
          socialRecruitment: '', // 社招校招
          stateOfCorrection: '', // 转正状态
          taxableCity: '', // 纳税城市
          userId: '', // 员工ID
          workMailbox: '', // 工作邮箱
          workingCity: '', // 工作城市
          workingTimeForTheFirstTime: '' // 首次参加工作时间
        }
      }
    },
    computed: {
      userId() {
        return this.$route.params.id
      }
    },
    methods: {
      saveJob() {
  
      }
    }
  }
  </script>
  ```

### 员工个人信息和岗位信息-读取-保存

- `src/api/employees.js`封装 **读取个人信息** **保存个人信息**  **读取岗位信息** **保存岗位信息**  

  ```js
  /** *
   *  读取用户详情的基础信息 (个人详情-下面的接口)
   * **/
  export function reqGetPersonalDetail(id) {
    return request({
      method: 'get',
      url: `/employees/${id}/personalInfo`
    })
  }
  
  /** *
   *  更新用户详情的基础信息 (个人详情-下面的接口)
   * **/
  export function reqUpdatePersonal(data) {
    return request({
      method: 'put',
      url: `/employees/${data.userId}/personalInfo`,
      data
    })
  }
  
  
  /** **
   * 获取用户的岗位信息  (岗位信息)
   * ****/
  export function reqGetJobDetail(id) {
    return request({
      method: 'get',
      url: `/employees/${id}/jobs`
    })
  }
  
  
  /**
   * 保存岗位信息  (岗位信息)
   * ****/
  export function reqUpdateJob(data) {
    return request({
      method: 'put',
      url: `/employees/${data.userId}/jobs`,
      data
    })
  }
  ```

- `src/views/employees/components/user-info.vue`**读取，保存个人信息**  **`user-info`** 

  ```jsx
  import { reqGetPersonalDetail, reqUpdatePersonal } from '@/api/employees'
  import { reqGetUserDetailById, reqSaveUserDetailById } from '@/api/user'
  
  created() {
    this.getUserDetailById()
    this.getPersonalDetail()
  },
  methods: {
    async getUserDetailById() {
      const { data } = await reqGetUserDetailById(this.userId)
      this.userInfo = data
    },
    async saveUser() {
      //  调用父组件
      await reqSaveUserDetailById(this.userInfo)
      this.$message.success('保存成功')
    },
    
    async getPersonalDetail() {
      const { data } = await reqGetPersonalDetail(this.userId) // 获取员工数据
      this.formData = data
    },
    async savePersonal() {
      await reqUpdatePersonal({ ...this.formData, userId: this.userId })
      this.$message.success('保存成功')
    }
  }
  ```

- `src/views/employees/components/job-info.vue`**读取，保存岗位信息**  **`job-info`**

  ```jsx
  import { reqGetEmployeeSimple, reqGetJobDetail, reqUpdateJob } from '@/api/employees'
  
  
  computed: {
    userId() {
      return this.$route.params.id
    }
  },
  created() {
    this.getJobDetail()
    this.getEmployeeSimple()
  },
  methods: {
    // 获取基本岗位详情数据
    async getJobDetail() {
      const { data } = await reqGetJobDetail(this.userId)
      this.formData = data
    },
    // 获取员工列表, 用于将来用户选择上级 (以及, 上级员工名称的显示)
    async getEmployeeSimple() {
      const { data } = await reqGetEmployeeSimple()
      this.list = data
    },
    async saveJob() {
      await reqUpdateJob({
        ...this.formData,
        userId: this.userId
      })
      this.$message.success('保存成功')
    }
  }
  ```

## 配置腾讯云Cos(图片的服务器) -- 封装图片上传组件

- 安装JavaScript SDK

  ```bash
  $ yarn add cos-js-sdk-v5
  ```

- 新建上传图片组件 `src/components/ImageUpload/index.vue`（基本结构）

  ```jsx
  <template>
    <el-upload list-type="picture-card" action="">
       <i class="el-icon-plus" />
    </el-upload>
  </template>
  ```

- 全局注册组件`src/components/index.js`

  ```js
  // 该文件负责所有的公共组件的全局注册
  // vue插件机制: Vue.use
  import PageTools from './PageTools'
  import UploadExcel from './UploadExcel'
  import ImageUpload from './ImageUpload'
  export default {
    install(Vue) {
      Vue.component('PageTools', PageTools) // 注册工具栏组件
      Vue.component('UploadExcel', UploadExcel) // 注册导入excel组件
      Vue.component('ImageUpload', ImageUpload) // 注册导入上传组件
    }
  }
  ```

### 点击图片进行预览

>  `src/components/ImageUpload/index.vue`
>
>  简单配置上传的图片数量 和 action  
>
> 要预览, 要有图片, 才能预览, 所以先配置 file-list
>
> 要预览的图标按钮, 需要配置 :on-preview

```jsx
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
    >
      <i class="el-icon-plus" />
    </el-upload>
    <!-- 弹层 -->
    <el-dialog width="600px" top="8vh" title="图片预览" :visible.sync="showDialog">
      <img width="100%" :src="imgUrl" alt="">
    </el-dialog>
  </div>
</template>

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
},
methods: {
  preview(file) {
  // 这里应该弹出一个层 层里是点击的图片地址
    this.imgUrl = file.url
    this.showDialog = true
  }
}
    
<style lang="scss" scoped>
.disabled {
  ::v-deep {
    .el-upload--picture-card {
      display: none
    }
  }
}
</style>
```

- 删除图片和添加图片`src/components/ImageUpload/index.vue`

  ```jsx
  <el-upload
    ...
    :on-remove="handleRemove"
    ...
  >
      
  // file 文件, 
  // fileList 删除后的文件列表(结构中的)
  // this.fileList 数据中的文件列表
  handleRemove(file, fileList) {
    this.fileList = this.fileList.filter(item => item.uid !== file.uid) // 从data中移出对应项
  }
  ```

- 添加操作

  ```jsx
  <el-upload
    ...
    :http-request="upload"
    ...
  >
      
  // 自定义上传动作 有个参数 有个file对象
  upload(params) {
    // 进行上传操作
    console.log(params.file)
  }
  ```

- 上传之前校验检查

  ```js
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
  },
  ```

- 添加文件时, 将页面的 fileList 同步到 this.fileList (数据中)

  ```jsx
  <el-upload
    ...
    :on-change="handleChange"
    ...
  >
  
  // 添加文件, 用户选了就应该新增文件预览
  // 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
  handleChange(file, fileList) {
    // console.log(fileList)
    // console.log(fileList.length)
    this.fileList = [...fileList]
  },
  ```

- 调用上传动作, 上传到腾讯云 (或后台)

  ```jsx
  upload(params) {
    if (!params.file) return
    // 将文件对象, 上传到腾讯云
    cos.putObject({
      Bucket: 'jepsonpp-75-1256203106', // 存储桶的名字
      Region: 'ap-shanghai', // 存储桶地域
      Key: params.file.name, // 上传到存储桶的文件名, 如果希望不重名, 可以对文件名进行处理
      StorageClass: 'STANDARD', // 上传模式, 标准模式
      Body: params.file, // 上传的文件对象
      // 上传的进度, 上传的过程中实时触发onProgress, 可以做进度条的展示
      onProgress: progressData => {
        // console.log(progressData)
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
    })
  }
  ```

### 上传的进度条显示

```jsx
<!-- 进度条组件 -->
<div v-if="showProgress">
  <div>上传进度：<el-progress style="width: 180px;" :percentage="percent" /></div>
</div>



upload(params) {
  // console.log(params.file)
  if (!params.file) return
  this.showProgress = true
  // 将文件对象, 上传到腾讯云
  // 执行上传操作
  COS.putObject({
    ...
    onProgress: progressData => {
      this.percent = parseInt(progressData.percent * 100)
    }
  }, (err, data) => {
    ...
    console.log(data)
    setTimeout(() => {
      this.showProgress = false
      this.percent = 0
    }, 500)
  })
},
```

## 在员工详情中应用上传组件

- `src\views\employees\components\user-info.vue`

  ```jsx
  <!-- 员工头像 -->
  <el-row class="inline-info">
    <el-col :span="12">
      <el-form-item label="员工头像">
        <image-upload ref="staffPhoto" />
      </el-form-item>
    </el-col>
  </el-row>
  
  // 上面的信息获取
  async getUserDetailById() {
    const { data } = await reqGetUserDetailById(this.userId)
    // 获取时, 要赋值头像
    this.$refs.staffPhoto.fileList = [
      { url: data.staffPhoto }
    ]
    this.userInfo = data
  },
  ```

- 当点击保存更新时，获取图片的内容,  进行提交

  ```jsx
  async saveUser() {
    // 拿到员工头像列表
    const staffPhotoRef = this.$refs.staffPhoto
    const fileList = staffPhotoRef.fileList // 读取上传组件的数据
    const uploadAllSuccess = staffPhotoRef.uploadAllSuccess // 是否都上传完成了
    console.log(staffPhotoRef)
    if (!uploadAllSuccess) {
      this.$message.error('当前有文件未上传完成')
      return
    }
    if (!fileList[0]) {
      this.$message.error('请上传员工头像')
      return
    }
    await reqSaveUserDetailById({
      ...this.userInfo,
      staffPhoto: fileList[0].url
    })
    this.$message.success('保存成功')
  },
  ```

### 员工的照片

```jsx
<!-- 员工照片 -->
<el-form-item label="员工照片">
  <!-- ref不要重名 -->
  <image-upload ref="picPhoto" :limit="1" />
</el-form-item>

async getPersonalDetail() {
  const { data } = await reqGetPersonalDetail(this.userId) // 获取员工数据
  this.$refs.picPhoto.fileList = [
    { url: data.staffPhoto }
  ]
  this.formData = data
},

// 下面的信息保存
async savePersonal() {
  const picPhotoRef = this.$refs.picPhoto
  const fileList = picPhotoRef.fileList // 读取上传组件的数据
  const uploadAllSuccess = picPhotoRef.uploadAllSuccess // 是否都上传完成了
  if (!uploadAllSuccess) {
    this.$message.error('当前有文件未上传完成')
    return
  }
  if (!fileList[0]) {
    this.$message.error('请上传员工照片')
    return
  }
  await reqUpdatePersonal({
    ...this.formData,
    staffPhoto: fileList[0].url,
    userId: this.userId
  })
  this.$message.success('保存成功')
}
```

### 员工列表显示图片

![员工列表](./media/员工列表.png)

- `src/views/employees/index.vue`

  ```jsx
  <el-table-column>
    <template #default="{ row }">
      <img v-imgerror="defaultImage" class="staff" :src="row.staffPhoto || defaultImage" alt="">
    </template>
  </el-table-column>
  
  data() {
    return {
      ...
      defaultImg: 'https://dss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2146034403,1504718527&fm=26&gp=0.jpg'
    }
  },
  
  
  <style lang="scss" scoped>
  .employees-container {
    .staff {
      width: 70px;
      height: 70px;
      border-radius: 50%;
    }
  }
  </style>
  ```

### 二维码生成

![二维码](./media/二维码.png)

- 安装生成二维码的插件

  ```bash
  $ yarn add qrcode
  ```

- 准备弹层

  ```jsx
  <el-dialog width="300px" title="二维码" :visible="showCodeDialog" :before-close="closeDialog">
    <el-row type="flex" justify="center">
      <canvas ref="myCanvas" />
    </el-row>
  </el-dialog>
  ```

- 注册点击事件

  ```jsx
  <el-table-column label="头像" prop="staffPhoto">
    <template #default="{ row }">
      <img v-imgerror="defaultImg" class="staff" :src="row.staffPhoto" alt="" @click="clickShowCodeDialog(row.staffPhoto)">
    </template>
  </el-table-column>
      
  import QrCode from 'qrcode'
  
  clickShowCodeDialog(url) {
    if (!url) return
    this.showCodeDialog = true
    this.$nextTick(() => {
      // 如果这里 url 写的是网址, 就会跳转到对应网址 (二维码分享效果)
      QrCode.toCanvas(this.$refs.myCanvas, url)
    })
  }
  ```

## BUG修复

- 调整接口api位置`src/api/employees.js`-->`src/api/user.js`

  ```js
  /** *
   * 保存员工的基本信息
   * **/
  export function reqSaveUserDetailById(data) {
    return request({
      method: 'put',
      url: `/sys/user/${data.id}`,
      data
    })
  }
  ```

- 接口导入位置变更`src/views/employees/components/detail.vue`

  ```jsx
  import { reqSaveUserDetailById } from '@/api/user'
  ```

- `src/views/employees/components/user-info.vue`

  ```js
  // 通过计算属性获取userId
  computed: {
    userId() {
      return this.$route.params.id
    }
  },
  ```

