<template>
  <div class="layout-container">
    <!-- 头部区域 -->
    <header>
      <van-nav-bar fixed v-if="$route.path !== '/user'">
        <!-- logo -->
        <template #left>
          <div class="logo" @click="$router.push('/')"></div>
        </template>
        <!-- search -->
        <template #right>
          <van-button
            @click="$router.push('/search')"
            class="search-btn"
            round
            type="info"
            size="small"
            icon="search"
          >
            搜索
          </van-button>
        </template>
      </van-nav-bar>
    </header>
    <!-- 中心内容区域 -->
    <main>
      <router-view></router-view>
    </main>
    <!-- 底部区域 -->
    <footer>
      <van-tabbar route>
        <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
        <van-tabbar-item to="/question" icon="chat-o">问答</van-tabbar-item>
        <van-tabbar-item to="/video" icon="video-o">视频</van-tabbar-item>
        <van-tabbar-item to="/user" icon="user-o">我的</van-tabbar-item>
      </van-tabbar>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Layout'
}
</script>

<style lang="scss" scoped>
.layout-container {
  padding-top: 46px;
  padding-bottom: 50px;
  // logo区域
  .logo {
    background: url('~@/assets/logo.png') no-repeat;
    background-size: cover;
    width: 100px;
    height: 30px;
  }
  // 搜索按钮
  .search-btn {
    background-color: #5babfb;
    width: 100px;
    font-size: 14px;
    .van-icon {
      color: #fff;
    }
  }
}
</style>
