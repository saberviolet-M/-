<template>
  <div class="home-container">
    <!-- tab栏 -->
    <van-tabs v-model="active">
      <van-tab v-for="item in channels" :key="item.id" :title="item.name">
        <article-list
          @closePopUp="showMore = false"
          @show-more="handleShowMore"
          :channel="item"
        >
        </article-list>
      </van-tab>
    </van-tabs>
    <!-- 弹出层 -->
    <van-popup v-model="showMore" :style="{ width: '80%' }">
      <more-action ref="more"></more-action>
    </van-popup>
    <!-- 频道列表开关 通过定位 -->
    <div class="bar-btn" @click="showChannelEditSheet">
      <van-icon name="wap-nav" />
    </div>
    <!-- actionSheet -->
    <van-action-sheet v-model="showChannelEdit" title="频道管理">
      <channel-edit
        :active="active"
        @update-active="updateActive"
        @update-curchannel="updateCurChannel"
        ref="edit"
      ></channel-edit>
    </van-action-sheet>
  </div>
</template>

<script>
import ArticleList from './component/ArticleList'
import MoreAction from './component/MoreAction'
import ChannelEdit from './component/ChannelEdit'
import { mapState, mapActions } from 'vuex'
export default {
  name: 'HomeIndex',
  components: {
    ArticleList,
    MoreAction,
    ChannelEdit
  },
  data() {
    return {
      active: 0,
      showMore: false,
      channelId: null,
      showChannelEdit: false
    }
  },
  computed: {
    ...mapState('channels', ['channels'])
  },
  methods: {
    ...mapActions('channels', ['getChannelsAsync', 'getAllChannelsAsync']),
    handleShowMore(channelId) {
      this.channelId = channelId
      this.showMore = true
      this.$nextTick(() => {
        this.$refs.more.isReport = false
      })
    },
    showChannelEditSheet() {
      if (this.$refs.edit) {
        this.$refs.edit.editing = false
      }
      this.showChannelEdit = true
      this.getAllChannelsAsync()
    },
    updateCurChannel(channel) {
      // 1. 关闭弹层
      this.showChannelEdit = false
      // 2. 切换到当前点击的频道上去 (更新下标active)
      const index = this.channels.findIndex(item => item.id === channel.id)
      if (index !== -1) {
        this.active = index
      }
    },
    updateActive(active) {
      this.active = active
    }
  },
  created() {
    this.getChannelsAsync()
    window.home = this
  }
}
</script>

<style lang="scss" scoped>
// 加了scoped后, 样式只会作用于当前组件模板内的内容, 不会向下渗透影响到子组件的元素
// 如果希望向下渗透, 深度作用选择器
// css  >>>,  less  /deep/,  sass  ::v-deep
.home-container {
  height: calc(100vh - 46px - 50px);
  padding-top: 46px;
  box-sizing: border-box;
  ::v-deep {
    .van-tabs__line {
      background-color: #3296fa;
    }
    .van-tabs {
      height: 100%;
      // 定位tab栏
      .van-tabs__wrap {
        position: fixed;
        left: 0;
        right: 30px;
        top: 46px;
      }
      .van-tabs__content {
        height: 100%;
        .van-tab__pane {
          height: 100%;
          // overflow: auto;
        }
      }
    }
  }
  // 频道管理的开关按钮
  .bar-btn {
    position: fixed;
    right: 5px;
    top: 57px;
    display: flex;
    align-items: center;
    background-color: #fff;
    opacity: 0.8;
    z-index: 1;
    .van-icon-wap-nav {
      font-size: 20px;
    }
  }
}
</style>
