/**
 * ブラウザやデバイスが対応しているイベントに合わせタッチスクロールもしくはマウススクロールを操作します
 */

const invalidation = (e) => {
  e.preventDefault()
}
const eventOpts = {
  passive: false,
}

// スクロールを禁止する
export function preventScroll() {
  window.addEventListener('touchmove', invalidation, eventOpts)
  window.addEventListener('wheel', invalidation, eventOpts)
}

// スクロール禁止を解除する
export function allowScroll() {
  window.removeEventListener('touchmove', invalidation, eventOpts)
  window.removeEventListener('wheel', invalidation, eventOpts)
}
