import whatInput from 'what-input'
import passive from '~/utils/passive'

export function isTouch() {
  return whatInput.ask('intent') === 'touch'
}

export function addMouseenterListener(el, fn) {
  const listener = (e) => {
    if (isTouch()) return
    fn(e)
  }
  el.addEventListener('mouseenter', listener, passive)
  return listener
}

export function addMousemoveListener(el, fn) {
  const listener = (e) => {
    if (isTouch()) return
    fn(e)
  }
  el.addEventListener('mousemove', listener, passive)
  return listener
}

export function addMouseleaveListener(el, fn) {
  const listener = (e) => {
    if (isTouch()) return
    fn(e)
  }
  el.addEventListener('mouseleave', listener, passive)
  return listener
}

export function removeMouseenterListener(el, listener) {
  el.removeEventListener('mouseenter', listener, passive)
}

export function removeMousemoveListener(el, listener) {
  el.removeEventListener('mousemove', listener, passive)
}

export function removeMouseleaveListener(el, listener) {
  el.removeEventListener('mouseleave', listener, passive)
}
