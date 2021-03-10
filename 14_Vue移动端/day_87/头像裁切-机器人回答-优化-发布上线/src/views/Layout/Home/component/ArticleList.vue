<template>
  <div class="articleList" @scroll="scroll" ref="refScroll">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="==私は底线もある=="
        @load="onLoad"
      >
        <van-cell
          v-for="item in list"
          :key="item.art_id.toString()"
          :title="item.title"
          @click="$router.push('/article/' + item.art_id.toString())"
        >
          <template #label>
            <van-grid :column-num="item.cover.images.length">
              <van-grid-item
                v-for="(img, index) in item.cover.images"
                :key="index"
              >
                <van-image lazy-load :src="img" />
              </van-grid-item>
            </van-grid>
            <!-- 文字说明 -->
            <div class="meta">
              <span>{{ item.aut_name }}</span>
              <span>{{ item.comm_count }}评论</span>
              <span>{{ item.pubdate | relative }}</span>
              <!-- 只有登录的用户, 才能看见这个 x 按钮 -->
              <span
                @click.stop="close(item.art_id.toString(), channel.id)"
                class="close"
                v-if="tokenInfo.token"
              >
                <van-icon name="cross"></van-icon>
              </span>
            </div>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import {
  reqGetArticles,
  reqDisLikeArticle,
  reqReportArticle
} from '@/api/article'
import { mapState } from 'vuex'
export default {
  name: 'ArticleList',
  props: {
    channel: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      refreshing: false,
      timestamp: null,
      ArticleId: null,
      channelId: null,
      scrollTop: 0
    }
  },
  computed: {
    ...mapState('user', ['tokenInfo'])
  },
  methods: {
    async onLoad() {
      if (!this.timestamp) {
        this.timestamp = +new Date()
      }
      // 异步更新数据
      console.log('当前数据的条数', this.list.length, '加载新数据')
      const {
        data: { data: articles }
      } = await reqGetArticles(this.channel.id, this.timestamp)
      this.timestamp = articles.pre_timestamp
      this.list = [...this.list, ...articles.results]
      this.loading = false
      if (articles.results === 0) {
        this.finished = true
      }
    },
    // 下拉刷新
    async onRefresh() {
      console.log('下拉刷新了')
      // 1. 取回最新的文章 (要传入最新的时间戳)
      const {
        data: { data: result }
      } = await reqGetArticles(this.channel.id, Date.now())
      // 保存时间戳, 以便加载下一页传入
      this.timestamp = result.pre_timestamp
      // 2. 将数据覆盖到 list中
      this.list = result.results
      // 3. 提示更新结果
      this.$toast.success('刷新成功')
      // 4. 结束loading状态
      this.refreshing = false
    },
    close(ArticleId, channelId) {
      this.$emit('show-more', channelId)
      this.ArticleId = ArticleId
      this.channelId = channelId
    },
    scroll(e) {
      // 它的作用是当用户在文章列表中滚动时，会记下滚动条的位置**scrollTop**。
      this.scrollTop = e.target.scrollTop
      console.log('滚动了')
    }
  },
  created() {
    this.$bus.$on('delDisLike', async () => {
      await reqDisLikeArticle(this.ArticleId)
      this.list = this.list.filter(
        item => item.art_id.toString() !== this.ArticleId
      )
      this.$emit('closePopUp') // 关闭弹出层
    })
    this.$bus.$on('report', async typeId => {
      if (this.channelId === window.home.channelId) {
        await reqReportArticle(this.ArticleId, typeId)
        this.$toast.success('等待处理,感谢反馈')
        this.list = this.list.filter(
          item => item.art_id.toString() !== this.ArticleId
        )
        this.$emit('closePopUp') // 关闭弹出层
      }
    })
  },
  activated() {
    this.$refs.refScroll.scrollTop = this.scrollTop
  }
}
</script>

<style lang="scss" scoped>
.articleList {
  height: 100%;
  overflow: auto;
  .meta {
    width: 100%;
    span {
      margin-right: 10px;
    }
    .close {
      float: right;
      margin-top: 4px;
    }
  }
}
</style>
