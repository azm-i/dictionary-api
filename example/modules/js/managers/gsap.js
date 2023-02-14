import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

//
// パラメーター
//

const param = {
  ease: {
    // medium: '.4,0,.2,1',
  },
}

//
// main
//

const keysEase = Object.keys(param.ease)
if (keysEase.length > 0) {
  gsap.registerPlugin(CustomEase)
  keysEase.forEach((name) => {
    CustomEase.create(name, param.ease[name])
  })
}
