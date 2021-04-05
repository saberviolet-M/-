'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Admin Template' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
// process.env 环境变量
const port = process.env.port || process.env.npm_config_port || 9528 // dev port

// 只有打包上线的环境, 才需要用到 cdn 加速
// 定义一个对象, 对象中放需要排除的项
let externals = {}
let cdn = { css: [], js: [] }

// 判断当前环境, 是否是 生产环境
const isProduction = process.env.NODE_ENV === 'production' // 判断是否是生产环境

if (isProduction) {
  externals = {
    // key(要排除的包名), value(引入的CDN包的全局变量名)
    'vue': 'Vue',
    'element-ui': 'ELEMENT',
    'xlsx': 'XLSX',
    'moment': 'moment'
  }
  cdn = {
    css: [
      'https://unpkg.com/element-ui/lib/theme-chalk/index.css' // element-ui css 样式表
    ],
    js: [
      // vue must at first!
      'https://unpkg.com/vue/dist/vue.js', // vuejs
      'https://unpkg.com/element-ui/lib/index.js', // element-ui js
      'https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/jszip.min.js',
      'https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/xlsx.full.min.js',
      'https://cdn.bootcdn.net/ajax/libs/moment.js/2.29.1/moment.min.js'
    ]
  }
}

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  // 启动开发服务器时, 会用到端口号
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    // 配置代理转发请求的规则 (符合规则的请求, 就会被转发, 就会被代理)
    proxy: {
      // 所有请求自己, 以 /api 开头的请求, 都将被代理
      // 1. http://localhost:8888/api/xxx 就会走代理

      // 2. 请求自己 http://localhost:8888/api/login => 转发到 https://www.baidu.com/api/login

      // 3. 问题: 如果将来的请求路径中, 不需要有代理的标识
      //    请求自己 http://localhost:8888/api/login => 转发到 https://www.baidu.com/login

      // 代理的路径标识: 所有的请求要走代理, 就必须有这个标识
      '/api': {
        // 代理的目标地址
        target: 'http://ihrm-java.itheima.net'
        // target: 'http://127.0.0.1:3000/'

        // 路径重写, 将代理的标识去掉 (看接口地址情况, 决定是否添加这个配置)
        // pathRewrite: {
        //   // 路径重写
        //   '^/api': ''
        // }
      }
    }
  },
  // webpack相关的配置, 以及相关的配置变量
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    // html文件中 title标题
    name: name,
    // 配置排除项, 打包时, 这些包不要了, 不打包了
    externals: externals,
    resolve: {
      // 配置别名 @, 意思: @ 指代 src
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // 注入cdn变量 (打包时会执行)
    config.plugin('html').tap(args => {
      args[0].cdn = cdn // 配置cdn给插件
      return args
    })

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
