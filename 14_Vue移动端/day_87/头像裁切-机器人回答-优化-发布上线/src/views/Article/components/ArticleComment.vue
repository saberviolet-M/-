<template>
  <div class="article-comments">
    <!-- 评论列表 -->
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell v-for="(item, index) in list" :key="index">
        <van-image
          slot="icon"
          round
          width="30"
          height="30"
          style="margin-right: 10px;"
          :src="item.aut_photo"
        />
        <span style="color: #466b9d;" slot="title">{{ item.aut_name }}</span>
        <div slot="label">
          <p style="color: #363636;">{{ item.content }}</p>
          <p>
            <span style="margin-right: 10px;">{{
              item.pubdate | relative
            }}</span>
            <van-button
              @click="clickShowReply(item)"
              size="mini"
              type="default"
            >
              回复
            </van-button>
          </p>
        </div>
        <van-icon
          @click="toggleCommentLike(item)"
          slot="right-icon"
          :name="item.is_liking ? 'like' : 'like-o'"
        />
      </van-cell>
    </van-list>
    <!-- 评论列表 -->

    <!-- 发布评论 -->
    <van-cell-group class="publish-wrap">
      <van-field clearable placeholder="请输入评论内容" v-model.trim="content">
        <van-button slot="button" size="mini" type="info" @click="addComment"
          >发布
        </van-button>
      </van-field>
      <!-- 回复组件 -->
      <van-popup
        v-model="isShowReply"
        round
        position="bottom"
        :style="{ height: '85%' }"
      >
        <comment-reply
          v-if="isShowReply"
          @close="isShowReply = false"
          :article-id="articleId"
          :currentComment="currentComment"
        ></comment-reply>
      </van-popup>
      <!-- /回复组件 -->
    </van-cell-group>
    <!-- /发布评论 -->
  </div>
</template>

<script>
import {
  reqAddComment,
  reqGetComments,
  reqAddCommentLike,
  reqDeleteCommentLike
} from '@/api/comment.js'
import CommentReply from './CommentReply'
export default {
  name: 'ArticleComment',
  components: { CommentReply },
  props: {
    articleId: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      list: [], // 评论列表
      loading: false, // 上拉加载更多的 loading
      finished: false, // 是否加载结束
      offset: null,
      content: '',
      isShowReply: false,
      currentComment: {}
    }
  },
  created() {
    this.onLoad()
  },
  methods: {
    async onLoad() {
      // 获取评论数据
      const res = await reqGetComments(this.articleId, this.offset)
      const arr = res.data.data.results
      // 将数据添加到list中
      this.list = [...this.list, ...arr]
      // 加载状态结束
      this.loading = false
      // 判断数据是否加载完成
      if (arr.length === 0) {
        this.finished = true
      }
      // 更新offset
      this.offset = res.data.data.last_id
    },
    // 切换评论的点赞状态
    async toggleCommentLike(comment) {
      try {
        const commentId = comment.com_id.toString()
        if (comment.is_liking) {
          // 点赞状态, 点击按钮时, 应该要取消点赞
          await reqDeleteCommentLike(commentId)
          this.$toast.success('取消喜欢成功')
        } else {
          // 非点赞状态, 点击按钮时, 应该要点赞
          await reqAddCommentLike(commentId)
          this.$toast.success('喜欢成功')
        }
        // 数据回显
        comment.is_liking = !comment.is_liking
      } catch (e) {
        console.log(e)
        this.$toast.fail('操作失败')
      }
    },
    async addComment() {
      try {
        if (this.content === '') return
        const {
          data: {
            data: { new_obj: comment }
          }
        } = await reqAddComment(this.articleId, this.content)
        this.list.unshift(comment)
      } catch (error) {
        this.$toast.fail('该文章已关闭评论')
      }
      this.content = ''
    },
    clickShowReply(currentComment) {
      this.isShowReply = true
      this.currentComment = currentComment
    }
  }
}
</script>

<style scoped lang="scss">
// 发表评论的区域是固定在下端的
.publish-wrap {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}
// 给发表评论区空出地方
.van-list {
  margin-bottom: 45px;
}
</style>
