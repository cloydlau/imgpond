const path = require('path')

const externals = process.env.NODE_ENV === 'development' ? {} : {
  'element-ui': 'element-ui',
  'pic-viewer': 'pic-viewer',
  'vue': 'vue'
}

module.exports = {
  pages: {
    index: {
      entry: 'demo/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  css: { extract: false },
  publicPath: './',
  outputDir: path.resolve(__dirname, './dist'),
  configureWebpack: {
    output: {
      filename: 'imgpond.min.js',
      library: 'imgpond',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      //libraryExport: 'default'
    },
    externals
  }
}
