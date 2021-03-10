<template>
  <div class="user">
    <!-- 用户个人资料 -->
    <div class="user-profile">
      <div class="info">
        <van-image round :src="user.photo" />
        <h3 class="name">
          {{ user.name }}
          <br />
          <van-tag size="mini">申请认证</van-tag>
        </h3>
      </div>
      <van-row>
        <van-col span="8">
          <p>{{ user.art_count }}</p>
          <p>动态</p>
        </van-col>
        <van-col span="8">
          <p>{{ user.follow_count }}</p>
          <p>关注</p>
        </van-col>
        <van-col span="8">
          <p>{{ user.fans_count }}</p>
          <p>粉丝</p>
        </van-col>
      </van-row>
    </div>
    <!-- /用户个人资料 -->

    <!-- 操作链接 -->
    <van-row class="user-links">
      <van-col span="8">
        <van-icon name="newspaper-o" color="#7af" />我的作品
      </van-col>
      <van-col span="8">
        <van-icon name="star-o" color="#f00" />我的收藏
      </van-col>
      <van-col span="8">
        <van-icon name="tosend" color="#fa0" />阅读历史
      </van-col>
    </van-row>
    <!-- /操作链接 -->

    <!-- 编辑入口 -->
    <van-cell-group class="user-group">
      <van-cell icon="edit" title="编辑资料" to="/userProfile" is-link />
      <van-cell icon="chat-o" title="小智同学" to="/userChat" is-link />
      <van-cell icon="setting-o" title="系统设置" is-link />
      <van-cell @click="logout" icon="warning-o" title="退出登录" is-link />
    </van-cell-group>
    <!-- /编辑入口 -->
  </div>
</template>

<script>
import { reqGetUserInfo } from '@/api/user'
import { mapMutations } from 'vuex'
export default {
  name: 'UserIndex',
  data() {
    return {
      user: {}
    }
  },
  created() {
    this.loadInfo()
  },
  methods: {
    ...mapMutations('user', ['removeTokenInfo']),
    async loadInfo() {
      const res = await reqGetUserInfo()
      this.user = res.data.data
    },
    logout() {
      // 通过方法调用
      this.$dialog
        .confirm({
          title: '温馨提示',
          message: '你确认要退出么?'
        })
        .then(() => {
          // 清除本地token对象信息
          this.removeTokenInfo()
          // 跳转登录页
          this.$router.push('/login')
        })
        .catch(() => {
          // on cancel
          // 就算你对取消操作不做任何处理，也需要保留catch。
          // 如果删除了catch，则点击确认对话框中的取消时，会抛出promise的错误
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.user {
  margin-top: -46px;
  padding-bottom: 50px;
  .user-profile {
    width: 100%;
    height: 200px;
    display: block;
    background: #3296fa;
    color: #fff;
    .info {
      display: flex;
      padding: 20px;
      align-items: center;
      .van-image {
        width: 64px;
        height: 64px;
      }
      .name {
        font-size: 16px;
        font-weight: normal;
        margin-left: 10px;
      }
      .van-tag {
        background: #fff;
        color: #3296fa;
      }
    }
    p {
      margin: 0;
      text-align: center;
    }
  }
  .user-group {
    margin-bottom: 15px;
  }
  .user-links {
    padding: 15px 0;
    font-size: 12px;
    text-align: center;
    background-color: #fff;
    .van-icon {
      display: block;
      font-size: 24px;
      padding-bottom: 5px;
    }
  }
}
</style>
