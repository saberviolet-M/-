const app = require('express')()
const server = require('http').createServer(app)
const axios = require('axios')
let timer
let randomMsg = [
  '不开心的话，我可以给你讲笑话哟~',
  '你是哪里人？我可以给你查天气哟~',
  '你喜欢听歌吗？我可以给你查歌词哟~',
  '英语不好的话，我能帮你翻译哟~'
]
// 配置跨域
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})
io.on('connection', (socket) => {
  let timer = null
  setTimeout(function () {
    socket.emit('message', {
      timestamp: Date.now(),
      msg: '你好,我是小智同学，非常欢迎你的到来，有什么想和我聊聊的吗？'
    })
  }, 500)
  autoReply()
  // 接收到消息后的30秒如果没有获取到新的消息，主动发送消息进行询问
  function autoReply() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      socket.emit('message', {
        timestamp: Date.now(),
        msg: '还在么,亲？不要不理我啊...'
      })
      socket.emit('message', {
        timestamp: Date.now(),
        msg: randomMsg[(Math.random() * randomMsg.length) | 0]
      })
      autoReply()
    }, 1000 * 30)
  }
  socket.on('message', async (msg) => {
    const res = await axios.get('http://api.qingyunke.com/api.php', {
      params: {
        key: 'free',
        appid: 0,
        msg: msg.msg
      }
    })
    socket.emit('message', {
      timestamp: Date.now(),
      msg: res.data.content
    })
    autoReply()
  })
})
server.listen(8888, () => {
  console.log('服务器启动成功了')
})
