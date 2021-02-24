module.exports = {
  devServer: {
    proxy: {
      '/v1/*': {
        // target: `${process.env.SW_PROXY_TARGET || 'http://172.31.90.104:31500'}`,
        target: `${process.env.SW_PROXY_TARGET || 'http://127.0.0.1:8084'}`,
        changeOrigin: true,
      },
    },
  },
  publicPath: './',
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: '[name]',
      });

    const mdRule = config.module.rule('md');
    mdRule.uses.clear();
    mdRule
      .test(/\.md$/)
      .use('text-loader')
      .loader('text-loader')
      .options({
        raw: true
      })
  },
};
