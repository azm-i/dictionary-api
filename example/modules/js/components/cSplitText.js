import { SplitText } from 'gsap/SplitText'
import gsapK from '~/utils/gsapK'
import Component from '~/parentClass/Component'
import media from '~/utils/media'

//
// パラメーター
//

const param = {
  yText: 26,
  durationTextHide: 0.35,
  durationHalf: 0.55,
  easeTextHide: 'power3.easeOut',
  ease: 'expo.easeOut',
  easeFade: 'power2.out',
  easeLeave: 'expo.easeInOut',
  easeTextHideLeave: 'power3.easeInOut',
  staggerEachHide: 0.03,
  staggerEach: 0.03,
  staggerEachHideLeave: 0.02,
  staggerEachLeave: 0.02,
  staggerEase: 'sine.in',
  staggerEaseIn: 'sine.in',
}

export default class CSplitText extends Component {
  static selectorRoot = '[data-text-split]'

  constructor(option) {
    super(option)
    if (media.isSp) return

    this._isPlay = false
    this._isOver = false

    this.el.style.position = 'relative'

    // まず対象要素内を行単位、かつ一文字ずつdivで分割
    const { lines, chars } = new SplitText(this.el, {
      type: 'lines, chars',
      span: true,
    })

    // 1行目のdiv取得
    const newElement = lines[0]
    newElement.style.display = 'inline-block'
    newElement.style.verticalAlign = 'top'
    newElement.style.overflow = 'hidden'

    // 1行目の一文字ずつ分割したdivの配列を変数に格納
    this._elsChar = chars

    // 1行目のdivをコピーして2行目のdivを生成
    const cloneElement = newElement.cloneNode(true)
    cloneElement.style.position = 'absolute'
    cloneElement.style.left = 0

    // 2行目の一文字ずつ分割したdivの配列を変数に格納
    this._elsNewChar = cloneElement.querySelectorAll('div')

    // 対象要素の中に2行目のdivを追加する
    this.el.appendChild(cloneElement)

    gsap.set(this._elsNewChar, {
      y: param.yText,
      opacity: 0,
    })
  }

  onMouseenter() {
    this._isOver = true
    if (!this._isPlay) {
      this.mouseenter()
    }
  }

  onMouseleave() {
    this._isOver = false
    if (!this._isPlay) {
      this.mouseleave()
    }
  }

  mouseenter() {
    this._isPlay = true

    this._elsChar.forEach((el) => {
      el.style.willChange = 'transform, opacity'
    })

    gsapK.to(this._elsChar, {
      opacity: 0,
      duration: param.durationTextHide,
      ease: param.easeFade,
      stagger: {
        each: param.staggerEachHide,
        ease: param.staggerEase,
      },
    })
    gsapK.to(this._elsChar, {
      y: -param.yText,
      duration: param.durationTextHide,
      ease: param.easeTextHide,
      stagger: {
        each: param.staggerEachHide,
        ease: param.staggerEase,
      },
    })

    gsapK.fromTo(
      this._elsNewChar,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: param.durationHalf,
        ease: param.easeFade,
        stagger: {
          each: param.staggerEach,
          ease: param.staggerEaseIn,
        },
      }
    )
    gsapK.fromTo(
      this._elsNewChar,
      {
        y: param.yText,
      },
      {
        y: 0,
        duration: param.durationHalf,
        ease: param.ease,
        stagger: {
          each: param.staggerEach,
          ease: param.staggerEaseIn,
        },
        onComplete: () => {
          this._isPlay = false
          if (!this._isOver) {
            this.mouseleave()
          }
        },
      }
    )
  }

  mouseleave() {
    this._isPlay = true

    gsapK.to(this._elsChar, {
      y: 0,
      opacity: 1,
      duration: param.durationHalf,
      ease: param.easeLeave,
      stagger: {
        each: param.staggerEachLeave,
        ease: param.staggerEaseIn,
      },
    })

    gsapK.to(this._elsNewChar, {
      y: param.yText,
      opacity: 0,
      duration: param.durationTextHide,
      ease: param.easeTextHideLeave,
      stagger: {
        each: param.staggerEachHideLeave,
        ease: param.staggerEase,
      },
      onComplete: () => {
        this._elsChar.forEach((el) => {
          el.style.willChange = 'auto'
        })

        this._isPlay = false
        if (this._isOver) {
          this.mouseenter()
        }
      },
    })
  }
}
