<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <!-- keep-alive 只要包裹了, 就会缓存, 所有的都缓存 -->
      <!-- :include 表示要对 哪些组件 做缓存 -->
      <!-- cachedViews: [组件1的name, 组件2的name] -->
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews.map(item => {
        // 让首字母大写
        return item[0].toUpperCase() + item.slice(1)
      })
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.app-main {
  /*50 = navbar  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}
.fixed-header+.app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
