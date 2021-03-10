<template>
  <div class="search">
    <!-- 搜索组件一级路由   $router.back()返回上一个页面-->
    <van-nav-bar left-arrow title="搜索中心" @click-left="$router.back()">
    </van-nav-bar>

    <!-- https://youzan.github.io/vant/#/zh-CN/search -->
    <van-search
      show-action
      placeholder="请输入搜索关键词"
      shape="round"
      v-model.trim="keyword"
      @input="getSuggestion"
    >
      <template #action>
        <div @click="clickSearchBtn">搜索</div>
      </template>
    </van-search>

    <!-- 联想建议 -->
    <van-cell-group v-if="keyword">
      <van-cell
        v-for="(item, index) in handlerSuggestionList"
        :key="item"
        @click="clickSuggestion(index)"
        icon="search"
      >
        <div v-html="item"></div>
      </van-cell>
    </van-cell-group>
    <!-- /联想建议 -->

    <!-- 搜索历史记录 -->
    <van-cell-group>
      <van-cell title="历史记录"> </van-cell>
      <van-cell
        v-for="(item, index) in history"
        :key="item"
        :title="item"
        @click="$router.push('/result?keywords=' + item)"
      >
        <van-icon @click.stop="delHistory(index)" name="close" />
      </van-cell>
    </van-cell-group>
    <!-- /搜索历史记录 -->
  </div>
</template>

<script>
import { reqGetSuggestion } from '@/api/search'
import { setHistory, getHistory } from '@/utils/storage'
export default {
  name: 'Search',
  data() {
    return {
      keyword: '', // 搜索关键字
      suggestion: [],
      history: getHistory(),
      timerId: null
    }
  },
  methods: {
    getSuggestion() {
      // 清空上一个定时器
      clearTimeout(this.timerId)
      // 定时器防抖
      this.timerId = setTimeout(async () => {
        // 检查当前关键字是否为空
        if (this.keyword === '') {
          this.suggestion = []
          return
        }
        // 调用方法, 发送请求
        const {
          data: {
            data: { options }
          }
        } = await reqGetSuggestion(this.keyword)
        this.suggestion = options
      }, 200) // 100-300ms 左右 不会太长
    },
    clickSearchBtn() {
      if (this.keyword === '') return
      this.addHistory(this.keyword)
      this.$router.push('/result?keywords=' + this.keyword)
    },
    clickSuggestion(index) {
      this.addHistory(this.suggestion[index])
      this.$router.push('/result?keywords=' + this.suggestion[index])
    },
    addHistory(str) {
      const i = this.history.findIndex(item => item === str)
      if (i !== -1) {
        this.history.splice(i, 1)
      }
      this.history.unshift(str)
      setHistory(this.history)
    },
    delHistory(index) {
      this.history.splice(index, 1)
      setHistory(this.history)
    }
  },
  computed: {
    handlerSuggestionList() {
      const reg = new RegExp(this.keyword, 'gi')
      return this.suggestion.map(item => {
        return item.replace(reg, match => {
          return `<span style="color: red;">${match}</span>`
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
