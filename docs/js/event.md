# グローバルイベント

グローバルなリサイズやスクロールのイベントは、基本 1 箇所（`src/modules/js/core/event.js`）で管理する。<br>
`config/param.js` のイベントパラメーター（`enableEventMouse` など）の値を `true` にすると有効になる。<br>
コールバックを登録するときは、イベントモジュールをインポートし、モジュールのコールバック登録関数（`onXxx()`）に関数を渡す。

## ウィンドウ

### `config/param.js` パラメーター

`enableEventWindow: true`

### インポート元

`~/events/window`

### 関数

- `onResize()`: モバイル端末でアドレスバーの高低切り替わり時はリサイズ処理しない
  - `isForce`: `emitResize()` で強制的にリサイズ処理を実行しているかどうか
- `onResetSize()`: すべての `onResize` イベントハンドラーが実行される前に処理したいもの
- `onResizeAlways()`: `onResize` で処理しない条件でも常に発火
- `onOrientationchange()`: `orientationchange` イベントハンドラー
  - `isHorizontal`: 横向きかどうか
- `emitResize()`: すべてのリサイズコールバックを強制的に実行

```js
import { onResize, onOrientationchange } from '~/events/window'

onResize((isForce) => {
  // `window.addEventListener('resize')` 発火後に実行される
})

onOrientationchange((isHorizontal) => {
  // `window.addEventListener('orientationchange')`
})
```

`emitResize` を実行すると、 `onResize` で登録したすべてのリサイズコールバックを強制的に実行させることができる。

```js
import { emitResize } from '~/events/window'

emitResize() // すべてのリサイズコールバックが実行される
```

## スクロール

### スムーススクロール

スムーススクロールを使用しているときは、 `src/modules/js/events/scroll.js` のモジュールを直接使用せずに、 `store.cScroll.onAnimateScroll()` に登録する。

#### 関数

- `store.cScroll.onAnimateScroll()`

##### 引数

- `y`: ウィンドウのスクロール位置ではなく、**スムーススクロールの仮想スクロール位置**
- `obj`: Locomotive Scroll ライブラリの `scroll` イベントハンドラーで渡される[`obj`](https://github.com/locomotivemtl/locomotive-scroll#instance-events)引数

```js
import store from '~/managers/store'

store.cScroll.onAnimateScroll((y, obj) => {
  // `y` はアニメーション中の仮想スクロール位置の Y 座標
})
```

## マウス

**※タッチイベントのときは発火しないようにしたい場合は、 `src/modules/js/utils/mouse.js` のほうの関数を使う。**

### `config/param.js` パラメーター

`enableEventMouse: true`

### インポート元

`~/events/mouse`

### 関数

- `onMousedown()`
- `onMousemove()`
- `onMouseup()`

#### 引数

- `clientX, clientY`: マウス位置座標

```js
import { onMousedown, onMousemove, onMouseup } from '~/events/mouse'

onMousedown((clientX, clientY) => {
  // `window.addEventListener('mousedown')`
})
onMousemove((clientX, clientY) => {
  // `window.addEventListener('mousemove')`
})
onMouseup((clientX, clientY) => {
  // `window.addEventListener('mouseup')`
})
```

## requestAnimationFrame

`requestAnimationFrame` をループさせるときは、直接呼び出さず、 `onTick()` でコールバックを登録する。

内部では `gsap.ticker` を利用している。[参考](https://greensock.com/docs/v3/GSAP/gsap.ticker)

### `config/param.js` パラメーター

`enableEventTick: true`

### インポート元

`~/events/tick`

### 関数

- `onTick()`

#### 引数

- `time`: **秒単位**のタイムスタンプ。 `requestAnimationFrame` と違い、**常に 0 からスタートする**。
- `count`: 毎フレームごとに 1 ずつカウントアップする数値。0 からスタートする。
- `rateFps`: FPS 60 をベースとしたときの割合（FPS 60 のときは 1 、FPS 30 のときは 2）。

```js
import { onTick } from '~/events/tick'

onTick((time, count, rateFps) => {
  // `requestAnimationFrame` のコールバックとほぼ同じ
  // `time` は秒単位
})
```

## 非同期ページ遷移

（※後日追記）
