<template>
  <div class="container">
    <!-- 固定导航 -->
    <van-nav-bar
      fixed
      left-arrow
      @click-left="$router.back()"
      title="小智同学"
    ></van-nav-bar>

    <!-- 聊天主体区域 -->
    <div class="chat-list" ref="refList">
      <div
        class="chat-item"
        :class="item.name === 'xz' ? 'left' : 'right'"
        v-for="(item, index) in list"
        :key="index"
      >
        <!-- 左侧是机器人小智 -->
        <template v-if="item.name === 'xz'">
          <van-image
            fit="cover"
            round
            src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic.baike.soso.com%2Fugc%2Fbaikepic2%2F10297%2F20180713141741-889617741_png_1280_1280_909767.jpg%2F0&refer=http%3A%2F%2Fpic.baike.soso.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1617937520&t=fdd175e6fd5c0acad9734de5a8a8a78e"
          />
          <div class="chat-pao">{{ item.msg }}</div>
        </template>
        <!-- 右侧是当前用户 -->
        <template v-else>
          <div class="chat-pao">{{ item.msg }}</div>
          <van-image fit="cover" round :src="userPhoto" />
        </template>
      </div>
    </div>
    <!-- /聊天主体区域 -->

    <!-- 对话区域 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="word" placeholder="说点什么...">
        <span @click="send()" slot="button" style="font-size:12px;color:#999"
          >提交</span
        >
      </van-field>
    </div>
    <!-- /对话区域 -->
  </div>
</template>

<script>
import { reqGetProfile } from '@/api/user'
import io from 'socket.io-client'

export default {
  name: 'UserChat',
  data() {
    return {
      userPhoto: '',
      word: '',
      list: [] // 对话记录
    }
  },
  created() {
    this.loadUserProfile()
    this.initSocket()
  },
  destroyed() {
    this.socket.close()
  },
  methods: {
    scrollUpDate() {
      this.$nextTick(() => {
        this.$refs.refList.scrollTop = this.$refs.refList.scrollHeight
      })
    },
    send() {
      if (this.word === '') {
        return
      }
      this.socket.emit('message', {
        msg: this.word,
        timestamp: Date.now()
      })
      this.list.push({
        name: 'me',
        msg: this.word,
        timestamp: Date.now()
      })
      this.word = ''
      this.scrollUpDate()
    },
    async loadUserProfile() {
      const {
        data: {
          data: { photo }
        }
      } = await reqGetProfile()
      this.userPhoto = photo
    },
    initSocket() {
      this.socket = io('http://localhost:8888')
      this.socket.on('connect', () => {
        this.$toast.success('连接成功...')
      })
      this.socket.on('message', ({ msg, timestamp }) => {
        this.list.push({
          name: 'xz',
          msg: msg,
          timestamp
        })
        this.scrollUpDate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background: #fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item {
      padding: 10px;
      .van-image {
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao {
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before {
          content: '';
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top: 0.5px solid #c2d9ea;
          border-right: 0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right {
  text-align: right;
  .chat-pao {
    margin-left: 0;
    margin-right: 15px;
    &::before {
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left {
  text-align: left;
  .chat-pao {
    margin-left: 15px;
    margin-right: 0;
    &::before {
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
