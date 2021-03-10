// 覆盖默认的webpack配置
module.exports = {
  // 相对路径访问资源
  publicPath: './',
  devServer: {
    port: 3000,
    open: true
  },
  // configureWebpack 配置是vue-cli中提供的一个配置项, 用于对webpack打包做更加精细的控制
  configureWebpack: config => {
    // 如果是生产环境, 在打包之后的js中去掉console.log
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  }
}
