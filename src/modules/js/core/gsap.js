import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

if (!window.gsap) {
  window.gsap = gsap

  //
  // パラメーター
  //

  const param = {
    ease: {
      // default: '.2,0,0,1',
      // ease: '.25,.1,.25,1',
      // medium: '.4,0,.2,1',
      // fast: '0,1,.4,1',
      // slide: '.47,.0,.1,1',
      slide: '.5,.0,.3,1',
    },
  }

  //
  // main
  //

  gsap.registerPlugin(CustomEase)

  const keysEase = Object.keys(param.ease)
  if (keysEase.length > 0) {
    keysEase.forEach((name) => {
      CustomEase.create(name, param.ease[name])
    })
  }
}
