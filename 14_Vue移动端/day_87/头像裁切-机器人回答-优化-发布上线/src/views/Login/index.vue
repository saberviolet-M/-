<template>
  <div>
    <!-- 导航条 -->
    <van-nav-bar title="登录" />
    <!-- 输入框 -->
    <van-cell-group>
      <van-field
        v-model="mobile"
        required
        label="手机号"
        placeholder="请输入手机号"
        :error-message="mobile_errmsg"
        @input="validate"
      />
      <van-field
        v-model="code"
        required
        label="验证码"
        placeholder="验证码(246810)"
        :error-message="code_errmsg"
        @input="validate"
      />
    </van-cell-group>
    <!-- 登录按钮 -->
    <div class="btn-wrap">
      <van-button type="info" @click="login">登录</van-button>
    </div>
    <div class="btn-wrap">
      <van-button type="primary" @click="testGetProfile"
        >测试获取用户信息</van-button
      >
    </div>
  </div>
</template>

<script>
import { reqLogin, reqGetProfile } from '@/api/user.js'
import { mapMutations } from 'vuex'
export default {
  name: 'Login',
  data() {
    return {
      mobile: '17611183627',
      code: '246810',
      mobile_errmsg: '',
      code_errmsg: ''
    }
  },
  methods: {
    ...mapMutations('user', ['setTokenInfo']),
    validate() {
      if (this.mobile.trim().length === 0) {
        this.mobile_errmsg = '手机号不能为空'
        return false
      }
      if (!/^1[3-9]\d{9}$/.test(this.mobile)) {
        this.mobile_errmsg = '请输入合法的手机号'
        return false
      }
      this.mobile_errmsg = ''

      if (this.code.trim().length === 0) {
        this.code_errmsg = '请输入验证码'
        return false
      }
      if (!/^\d{6}$/.test(this.code)) {
        this.code_errmsg = '请输入正确的验证码'
        return false
      }
      this.code_errmsg = ''

      return true
    },

    async login() {
      if (!this.validate()) return
      this.$toast.loading({
        duration: 0,
        overlay: true,
        message: '登录中...',
        forbidClick: true
      })
      try {
        const {
          data: { data }
        } = await reqLogin(this.mobile, this.code)
        this.setTokenInfo(data)
        await reqLogin(this.mobile, this.code)
        this.$toast.success('登录成功')
        const backto = this.$route.query.backTo || '/'
        this.$router.push(backto)
      } catch (error) {
        console.log(error)
        this.$toast.fail('登录失败')
      }
    },
    async testGetProfile() {
      const data = await reqGetProfile()
      console.log(data)
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-wrap {
  padding: 20px;
  .van-button {
    width: 100%;
    color: #fff;
    border-radius: 5px;
  }
}
</style>
