<template>
  <div class="article-container">
    <!-- 导航栏 -->
    <van-nav-bar
      fixed
      left-arrow
      @click-left="$router.back()"
      title="文章详情"
    ></van-nav-bar>
    <!-- /导航栏 -->

    <!-- 加载中 loading -->
    <van-loading v-if="loading" class="article-loading" />
    <!-- /加载中 loading -->

    <!-- 文章详情 -->
    <div class="detail" v-else>
      <h3 class="title">{{ article.title }}</h3>
      <div class="author">
        <van-image
          :src="article.aut_photo"
          round
          width="1rem"
          height="1rem"
          fit="fill"
        />

        <div class="text">
          <p class="name">{{ article.aut_name }}</p>
          <p class="time">{{ article.pubdate | relative }}</p>
        </div>
        <van-button round size="small" type="info" @click="toggleFollow">
          {{ article.is_followed ? '取关' : '+ 关注' }}
        </van-button>
      </div>
      <div class="content" v-html="article.content"></div>
      <van-divider>END</van-divider>
      <div class="zan">
        <van-button
          round
          size="small"
          @click="toggleLike"
          hairline
          type="primary"
          plain
          :icon="article.attitude === 1 ? 'good-job' : 'good-job-o'"
        >
          {{ article.attitude === 1 ? '取消点赞' : '点赞' }}
        </van-button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <van-button
          @click="toggleDislike"
          round
          size="small"
          hairline
          type="danger"
          plain
          icon="delete"
        >
          {{ article.attitude === 0 ? '取消不喜欢' : '不喜欢' }}
        </van-button>
      </div>
    </div>
    <!-- /文章详情 -->

    <!-- 文章评论 -->
    <article-comment :articleId="id"></article-comment>
    <!-- /文章评论 -->
  </div>
</template>

<script>
// push时传对象, params (写name传递) 就通过 this.$route.params获取
// push时传对象, query  (写path)     就通过 this.$route.query 获取
// 动态路由传参  /article/:id        this.$route.params 获取
import {
  reqGetArticleDetail,
  reqDeleteLike,
  reqAddLike,
  reqDeleteDisLike,
  reqAddDisLike
} from '@/api/article.js'
import { reqFollowUser, reqUnFollowUser } from '@/api/user'
import ArticleComment from './components/ArticleComment.vue'
export default {
  components: { ArticleComment },
  name: 'ArticleIndex',
  props: {
    id: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      loading: true, // 控制加载中的 loading 状态
      article: {}
    }
  },
  created() {
    console.log('this.id', this.id)
    this.loadArticle()
  },
  methods: {
    async loadArticle() {
      const {
        data: { data }
      } = await reqGetArticleDetail(this.id)
      // 保存文章详情
      this.article = data
      // 取消加载状态
      this.loading = false
    },
    async toggleFollow() {
      try {
        // 根据当前的 is_followed 状态, 决定发送什么请求
        if (this.article.is_followed) {
          // 当前为 true, 点击按钮, 要取消
          await reqUnFollowUser(this.article.aut_id)
        } else {
          // 当前为 false, 点击按钮, 要关注
          await reqFollowUser(this.article.aut_id)
        }
        // 成功后更新视图, 直接更新状态即可
        this.article.is_followed = !this.article.is_followed
        this.$toast.success('操作成功')
      } catch (e) {
        this.$toast.success('操作失败')
      }
    },
    async toggleLike() {
      // 根据attitude来决定调用哪个方法
      if (this.article.attitude === 1) {
        // 点击时, 要取消点赞
        await reqDeleteLike(this.article.art_id.toString())
        this.article.attitude = -1
      } else {
        // 点击时, 要进行点赞请求
        await reqAddLike(this.article.art_id.toString())
        this.article.attitude = 1
      }
      this.$toast.success('操作成功')
    },
    async toggleDislike() {
      // 根据attitude来决定调用哪个方法, 如果是0, 说明是不喜欢, 点击就要取消不喜欢
      if (this.article.attitude === 0) {
        await reqDeleteDisLike(this.article.art_id.toString())
        this.article.attitude = -1
      } else {
        await reqAddDisLike(this.article.art_id.toString())
        this.article.attitude = 0
      }
      this.$toast.success('操作成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.article-container {
  position: absolute;
  left: 0;
  top: 0;
  overflow-y: scroll;
  width: 100%;
  height: 100%;
}
.article-loading {
  padding-top: 100px;
  text-align: center;
}
.error {
  padding-top: 100px;
  text-align: center;
}
.detail {
  padding: 50px 10px;
  .title {
    font-size: 16px;
  }
  .zan {
    text-align: center;
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.3;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  .content {
    font-size: 14px;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    ::v-deep img {
      max-width: 100%;
      background: #f9f9f9;
    }
  }
}
</style>
