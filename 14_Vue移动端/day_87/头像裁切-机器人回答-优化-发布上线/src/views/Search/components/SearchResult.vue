<template>
  <div class="search-result">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="$route.query.keywords + '的搜索结果'"
      left-arrow
      fixed
      @click-left="$router.back()"
    />
    <!-- /导航栏 -->

    <!-- 文章列表 -->
    <van-list
      class="article-list"
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell
        v-for="item in list"
        :key="item.art_id.toString()"
        :title="item.title"
        @click="$router.push('/article/' + item.art_id.toString())"
      />
    </van-list>
    <!-- /文章列表 -->
  </div>
</template>

<script>
import { reqGetSearch } from '@/api/search'
export default {
  name: 'SearchResult',
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      page: 1
    }
  },
  created() {
    console.log(this.$route.query.keyword)
  },
  methods: {
    async onLoad() {
      // 1. 根据关键字调用 api 获取数据
      const keyword = this.$route.query.keywords
      const {
        data: {
          data: { results }
        }
      } = await reqGetSearch(keyword, this.page)

      // 2. 将结果, 追加到 list 后面
      const arr = results
      this.list = [...this.list, ...arr]
      this.page++ // 页码自增

      // 3. 将loading改成false
      this.loading = false

      // 4. 判断是否已经全部加载了数据
      if (arr.length === 0) {
        this.finished = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-result {
  .article-list {
    margin-top: 39px;
  }
}
</style>
