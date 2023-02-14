//
// パラメーター
//

const param = {
  // 圧縮
  enableMinify: true, // CSS,JSを圧縮するかどうか

  // ポリフィル
  enablePolyfill: false, // ポリフィルを使うかどうか

  // HTML
  enableWebP: true, // WebP変換を有効にするかどうか

  // CSS
  enableMinFontSize: false, // 自動で最小フォントサイズを10pxに設定するコードを出力する

  // アナリティクス
  enableAutoSendGaView: false, // 非同期遷移の場合にGAのページビューイベントを送信するかどうか

  // イベント
  enableEventTick: true, // グローバルの requestAnimationFrame イベンドなどを有効にするかどうか
  enableEventWindow: true, // グローバルの resize イベンドなどを有効にするかどうか
  enableEventScroll: false, // グローバルの scroll イベンドを有効にするかどうか
  enableEventMouse: false, // グローバルの mousemove イベンドなどを有効にするかどうか

  // アニメーション
  enableSmoothScroll: false, // スムーススクロールを有効にするかどうか
  enableEventAsynchronousTransition: false, // グローバルの非同期遷移イベンドを有効にするかどうか
  enableEventPace: false, // グローバルの Pace イベンドを有効にするかどうか

  // ライブラリ
  importLibraryThree: false, // three.js ライブラリを読み込むかどうか
  importLibraryThreePostProcessing: false, // three.js ライブラリのPost Processingを読み込むかどうか

  // ライブラリオプション
  isShowDatGui: false, // dat.GUI をブラウザ上に表示させるかどうか
  isOpenDatGui: false, // dat.GUI を開いた状態にするかどうか
}

// exampleモードではこちらのパラメーターが優先される
const paramExample = {
  // ポリフィル
  enablePolyfill: true, // ポリフィルを使うかどうか

  // アニメーション
  enableSmoothScroll: true, // スムーススクロールを有効にするかどうか
  enableEventAsynchronousTransition: true, // グローバルの非同期遷移イベンドを有効にするかどうか
  enableEventPace: true, // グローバルの Pace イベンドを有効にするかどうか

  // ライブラリ
  importLibraryThree: true, // three.js を有効にするかどうか

  // ライブラリオプション
  isShowDatGui: true, // dat.GUI をブラウザ上に表示させるかどうか
  isOpenDatGui: true, // dat.GUI を開いた状態にするかどうか
}

const isCache = process.env.NODE_CACHE === 'true'
const isPhp = process.env.NODE_PHP === 'true' || null
let isProd = process.env.NODE_ENV === 'production'
const isDevPhp = isPhp && !isProd
isProd = isProd || isPhp
const isExample = process.env.NODE_EXAMPLE === 'true'
const isTinypng = process.env.NODE_TINYPNG === 'true'

if (isExample) {
  Object.assign(param, paramExample)
}

module.exports = {
  ...param,

  isProd,
  isDev: !isProd,
  isExample,
  isCache,
  isPhp,
  isDevPhp,
  isTinypng,
}
