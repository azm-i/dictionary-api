if (process.env.isSupportIe) {
  // .browserslistrcでIEが対象の場合に追加されるポリフィル

  /**
   * HTML
   * SVGのuseタグ
   */
  const svg4everybody = require('svg4everybody')
  svg4everybody()

  /**
   * CSS
   * object-fit
   */
  // const objectFitImages = require('object-fit-images')
  // objectFitImages(null, { watchMQ: true })

  /**
   * CSS
   * position:sticky
   */
  // require('stickyfilljs').add(document.querySelectorAll('[data-sticky]'))
}
