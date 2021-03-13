# day89

## 登录模块

> [**线上展示地址**](http://ihrm-java.itheima.net/#/login)

### 设置固定的本地访问端口 和 网站名称

#### 访问端口

- `vue.config.js`文件中

  ```js
  /** 
   * 分析：
   *   1. 端口号优先为process.env.port>process.env.npm_config_port>9528||npm run dev --port = 9528
   *	 2. 因此寻找process.env.port修改
   *	 3. process.env.port实际上是一个nodejs服务下的环境变量
   */
  const port = process.env.port || process.env.npm_config_port || 9528
  ...
  devServer: {
    port: port,
    ...
  },
  ```

- `process.env.port`

  > 在项目下, 存在**`.env.development`**和**`.env.production`**两个文件
  >
  > - 当运行`npm run dev`进行**开发调试**的时候,会加载执行`.env.development`文件内容
  >
  > - 当运行`npm run build:prod`进**行生产环境打包**的时候,会加载执行`.env.production`文件内容

  设置开发环境的接口，直接在`.env.development `中写入对于port变量的赋值即可

  ```bash
  # 配置端口
  port = 3000
  ```

  **PS：**修改服务的配置文件,想要生效的话,必须要重新启动服务，值`3000`后面不能留有空格

#### 网站名称

- `vue.config.js`文件中存在如下变量，实际来源于`src/settings.js`

  ```js
  const defaultSettings = require('./src/settings.js')
  ...
  const name = defaultSettings.title || 'vue Admin Template' // page title
  ...
  configureWebpack: {
  // provide the app's title in webpack's name field, so that
  // it can be accessed in index.html to inject the correct title.
    name: name,
  },
  ```

- `src/settings.js`中可修改网站名称

  ```js
  module.exports = {
    title: '人力资源管理平台',
    ...
  }
  ```

### 登录页面的基础布局`src/views/login/index.vue`

![login](./media/login.png)

#### 头部背景

![头部背景](./media/头部背景.jpg)

```jsx
<!-- 放置标题图片 @是设置的别名-->
<div class="title-container">
        <h3 class="title">
          <img src="@/assets/common/login-logo.png" alt="">
        </h3>
 </div>
```

#### 设置背景图片

```css
.login-container {
  background-image: url('~@/assets/common/login.jpg'); // 设置背景图片
  background-position: center; // 将图片位置设置为充满整个屏幕
}
```

#### 设置手机号和密码的字体颜色

```css
$light_gray: #407ffe;
```

#### 设置输入表单整体背景色

```css
.el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.9); // 输入登录表单的背景色
    border-radius: 5px;
    color: #454545;
  }
```

#### 设置错误信息的颜色

```css
 .el-form-item__error {
    color: #fff;
    font-size: 14px;
 }
```

#### 设置登录按钮的样式

> 需要给el-button 增加一个loginBtn的class样式

```css
.loginBtn {
  background: #407ffe;
  height: 64px;
  line-height: 32px;
  font-size: 24px;
}
```

#### 修改显示的提示文本和登录文本

```jsx
<div class="tips">
   <span style="margin-right:20px;">账号: 13800000002</span>
   <span> 密码: 123456</span>
</div>
```

### 登录表单的校验

![表单校验](./media/表单校验.png)

```jsx
<el-form
  ref="loginForm"
  :model="loginForm"
  :rules="loginRules"
  ...
>
```

> 基础模板采用的是**`username`**的字段
>
> 但是实际接口中采用的是**`mobile`**的字段
>
> 所以将**`username`**改成**`mobile`**
>
> **PS：**
>
> - 基础模板中**placeHolder**占位符是英文,可换成中文
>
> - 登录按钮文字同样可换成中文

```jsx
<el-form-item prop="mobile">
  <span class="svg-container">
    <svg-icon icon-class="user" />
  </span>
  <el-input
    ref="mobile"
    v-model="loginForm.mobile"
    placeholder="Username"
    name="username"
    type="text"
    tabindex="1"
    auto-complete="on"
  />
</el-form-item>
data() {
  return {
    loginForm: {
      mobile: '13800000002',
      password: '123456'
    }
  }
```

#### 校验手机号和校验密码

- 密码`密码必填，长度6-16位之间`

  ```jsx
  data() {
    return {
      ...
      loginRules: {
        ...
        password: [
          { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
          { min: 6, max: 16, message: '密码必须是6-16位', trigger: ['blur', 'change'] }
        ]
      },
      ...
    }
  },
  ```

- 在`utils/validate.js`方法中增加了一个校验手机号的方法

  > `utils/validate.js`是一个专门存放校验工具方法的文件

  ```js
  /**
   * 校验手机号
   * **/
  export function validMobile(str) {
    return /^1[3-9]\d{9}$/.test(str) // 校验手机号
  }
  ```

  ```js
  /* src/views/login/index.vue */
  import { validUsername } from '@/utils/validate'
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    return {
      ...
      loginRules: {
        mobile: [
          { required: true, message: '请输入手机号', trigger: ['blur', 'change'] },
          { trigger: ['blur', 'change'], validator: validateUsername }
        ],
        ...
  },
  ```

### 请求跨域

> 前端开发处理跨域问题

![ACAO](./media/ACAO.png)

#### Vue-Cli配置跨域代理 

> ##### 为什么会出现跨域？
>
> **浏览器**为了保证安全, 有着同源策略, 只要域名端口协议有一个不同, 就是不同源,  也就是跨域

![跨域](./media/跨域.png)

> ##### 常见的跨域解决方案
>
> - **jsonp**
>   - 原理: 利用 script 标签,  src 去加载服务器的资源 (不受同源策略限制)
>   - 优点: 兼容性好
>   - 缺点: 必须只能是 get 请求
> - **cors (主流)**
>   - 原理: 后台设置请求头` Access-Control-Allow-Origin: `
>   - 优点: 简单方便, 前端代码不用动
>   - 缺点: 兼容性 IE10+ (不兼容IE9)
> - **代理服务器**
>   - 遇到的跨域是位于**开发环境** (webpack代理服务器)
>   - 真正部署上线时的跨域是**生产环境** (nginx服务器, 或者后台配cors)

#### 解决开发环境的跨域问题

> ##### 开发环境的跨域
>
> - 在**`vue-cli脚手架环境`**下开发启动服务时，访问接口所遇到的跨域问题
>
> ##### vue-cli配置 -- webpack的反向代理
>
> - vue-cli在本地`开启了一个服务`，可以通过这个服务`代理请求`，解决跨域问题

![反向代理](./media/反向代理.png)

- `vue.config.js`[**代理选项**](https://cli.vuejs.org/zh/config/#devserver-proxy)

  ```js
  proxy: {
    '/api': {
      target: 'http://ihrm-java.itheima.net/'
    }
  }
  ```

### 封装单独的登录接口`src/api/user.js`

```js
import request from '@/utils/request'

export function reqLogin(data) {
  return request({
    method: 'POST',
    url: '/sys/login',
    data
  })
}
```

#### 基于环境变量配置基地址`utils/request.js`

```js
import axios from 'axios'

// 创建了axios实例, 使用的是自己的配置项
const service = axios.create({
  // 开发环境, 找 env.development, 找 VUE_APP_BASE_API 变量
  // 生产环境, 找 env.production,  找 VUE_APP_BASE_API 变量
  baseURL: process.env.VUE_APP_BASE_API, // 环境变量
  timeout: 5000 // request timeout
})

// 请求拦截器

// 响应拦截器

export default service
```

- `.env.development`  yarn dev 加载

  ```bash
  # base api
  # 最终请求地址 /api/sys/login => http://ihrm-java.itheima.net/api/sys/login
  VUE_APP_BASE_API = '/api'
  ```

- `.env.production`    yarn build:prod 加载

  ```bash
  # base api
  # 最终请求地址: http://ihrm-java.itheima.net/api/sys/login
  VUE_APP_BASE_API = 'http://ihrm-java.itheima.net/api/'
  ```

### vuex 管理 token

- `store/modules/user.js`准备状态

  ```js
  const state = {
    token: null // token字符串
  }
  const mutations = {}
  const actions = {}
  const getters = {}
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
  }
  ```

-  `store/modules/user.js` 封装 **action** 和 对应的 **mutation**

  ```js
  const mutations = {
    setToken(state, newToken) {
      state.token = newToken
    }
  }
  const actions = {
    async login(context, data) {
      const res = await reqLogin(data)
      const newToken = res.data.data
      context.commit('setToken', newToken)
    }
  }
  ```

- 添加 token 的 getters

  > 为了更好的让其他模块和组件更好的获取token数据，
  >
  > 可以在**`store/getters.js`**中将token值, 添加成公共的 getters, 便于将来访问

  ```js
  const getters = {
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    token: state => state.user.token
  }
  export default getters
  ```

### token持久化

> 在登录时, 已经可以成功的将token存到 vuex 中了
>
>  但是 vuex 刷新会丢失, 所以需要结合web存储进行持久化
>
> ##### cookie 做token存储
>
> - 好处: 限制只能在https环境, 限制js脚本运行时访问, 避免xss攻击
>
> 在**`utils/auth.js`**中,基础模板已经为提供了**`获取token`**,**`设置token`**,**`删除token`**的方法,可以直接使用

```js
import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
```

- `src/store/modules/user.js`一进来优先从缓存cookie中取

  ```js
  import { getToken, setToken } from '@/utils/auth'
  const state = {
    token: getToken() || null
  }
  ```

- vuex中存token时, 也同步存到cookie中

  ```js
  const mutations = {
    setToken(state, newToken) {
      state.token = newToken
      setToken(newToken)
    }
  }
  ```

#### promise 包装 action 操作

> 将来如果登录**action**成功了,  存**token**(vuex相关的)，页面中就要跳转到首页(页面相关)，如果登录失败了, 还需要给用户提示
>
> **action**是异步的, 需要用 promise 包装下, 才便于处理, 且使用**promise**封装时的函数不能直接用**async**, 需要改写代码

```js
import { reqLogin } from '@/api/user'

const actions = {
  login(context, data) {
    return new Promise((resolve, reject) => {
      // 发送登录请求, 异步操作
      reqLogin(data).then(res => {
        const newToken = res.data.data
        context.commit('setToken', newToken)
        // 成功resolve
        resolve(res)
      }).catch(error => {
        // 失败reject
        reject(error)
      })
    })
  }
}
```

### axios的响应拦截器处理响应

> 处理axios默认的一层包裹
>
> 统一对错误响应进行处理 => 提示用户错误消息, 并`reject`抛出错误, 让代码走`.catch`

**`src/utils/request.js`**

```js
// 响应拦截器
instance.interceptors.response.use(value => {
  // 对响应数据做点什么
  const res = value.data
  const { message, success } = res
  if (!success) {
    Message.error(message) // 提示错误消息
    return Promise.reject(new Error(message)) // 业务已经错误了, 应该进catch
  }
  return res
}, reason => {
  // 对响应错误做点什么, 服务器错误, 400, 404, 500
  console.dir(reason) // 便于调试
  Message.error(reason.message) // 提示错误消息
  return Promise.reject(reason)
})
```

### 完成登录功能

**`src\views\login\index.vue`**

```js
// 通过辅助函数调用vuex中方法
import { mapActions } from 'vuex'

methods: {
  ...mapActions('user', ['login']), // 调用user模块中的login方法
  handleLogin() {
    // 发送请求前的再次验证表单选项
    this.$refs.loginForm.validate(valid => {
      if (valid) {
        // 开启登录按钮的加载动画
        this.loading = true
        // 发送请求
        this.login(this.loginForm).then(value => {
          // 成功后进入首页
          this.$router.push('/')
        }).catch(error => {
          // 统一处理错误信息
          console.dir(error)
          this.$message.error(error.message)
        }).finally(() => {
          // promise无论resolve还是reject都会走到.finally
          // 关闭加载动画
          this.loading = false
        })
      } else {
        console.log('error submit!!!')
        return false
      }
    })
  }
}
```



