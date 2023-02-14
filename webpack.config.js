const path = require('path')
const globby = require('globby')
const webpack = require('webpack')

const CONFIG = require('./config')
const param = require('./param')
const { GA_ID, GTM_ID } = require('./config/site-info')
const { isDevPhp } = require('./param')

//
// config
//

module.exports = (env, argv) => {
  const isProd = argv && argv.mode === 'production'
  const sourceMap = !isProd

  // すべての JS ファイルをエントリポイントとして読み込む
  const entry = {}
  globby
    .sync(['**/*.js', '!**/_*/**', '!**/_*'], {
      cwd: CONFIG.path.src,
      onlyFiles: true,
    })
    .forEach((file) => {
      const name = file.replace(/\.[^.]+$/, '')
      entry[name] = path.resolve(CONFIG.path.src, file)
    })

  return {
    mode: isProd ? 'production' : 'development',
    watch: !isProd || Boolean(isDevPhp),
    context: CONFIG.path.root,
    entry,

    output: {
      path: CONFIG.path.distAssets,
      filename: '[name].js',
    },

    resolve: {
      alias: {
        '~': path.resolve(CONFIG.path.modules, 'js'),
        '@': path.resolve(CONFIG.path.modules, 'js'),
      },
      fallback: {
        '~': path.resolve(CONFIG.path.modulesDefault, 'js'),
        '@': path.resolve(CONFIG.path.modulesDefault, 'js'),
      },
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'babel-loader',
          exclude: /node_modules\/(?!(dom7|ssr-window|swiper)\/).*/,
        },
        {
          test: /\.(glsl|vs|fs|vert|frag)$/,
          exclude: /node_modules/,
          use: [
            'raw-loader',
            {
              loader: 'glslify-loader',
              options: {
                basedir: path.resolve(CONFIG.path.modulesDefault, 'js/glsl'),
              },
            },
          ],
        },
      ],
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development'
        ),
        'process.env.idPerfectPixel': JSON.stringify(
          !isProd ? 'chromeperfectpixel-overlay-container' : false
        ),
        'process.env.rootDir': JSON.stringify(CONFIG.SITE_INFO.rootDir),
        'process.env.rootDirAssets': JSON.stringify(
          CONFIG.SITE_INFO.rootDirAssets
        ),
        'process.env.enableAutoSendGaView': JSON.stringify(
          param.enableAutoSendGaView
        ),
        'process.env.enableEventTick': JSON.stringify(param.enableEventTick),
        'process.env.enableEventWindow': JSON.stringify(
          param.enableEventWindow
        ),
        'process.env.enableEventScroll': JSON.stringify(
          param.enableEventScroll
        ),
        'process.env.enableEventMouse': JSON.stringify(param.enableEventMouse),
        'process.env.enableEventPace': JSON.stringify(param.enableEventPace),
        'process.env.enableEventAsynchronousTransition': JSON.stringify(
          param.enableEventAsynchronousTransition
        ),
        'process.env.enableSmoothScroll': JSON.stringify(
          param.enableSmoothScroll
        ),
        'process.env.isOpenDatGui': JSON.stringify(param.isOpenDatGui),
        'process.env.isShowDatGui': JSON.stringify(param.isShowDatGui),
        'process.env.isSupportIe': JSON.stringify(CONFIG.browsers.isSupportIe),
        'process.env.enablePolyfillIntersectionObserver': JSON.stringify(
          param.enablePolyfillIntersectionObserver
        ),
        GA_ID: JSON.stringify(GA_ID),
        GTM_ID: JSON.stringify(GTM_ID),
      }),
    ],

    devtool: sourceMap ? 'eval-source-map' : false,

    // ライブラリ系は vendor.js に出力させる
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: 'assets/js/vendor',
      },
      minimize: param.enableMinify && isProd,
    },
  }
}
