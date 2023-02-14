const { isPhp } = require('../param')

module.exports = {
  'doctype-first': false,
  'alt-require': true,
  'attr-lowercase': [
    'viewBox',
    'textLength',
    'clipPathUnits',
    'filterUnits',
    'stdDeviation',
  ],
  'tagname-lowercase': [
    'clipPath',
    'textPath',
    'feOffset',
    'feGaussianBlur',
    'feFlood',
    'feComposite',
    'feBlend',
  ],
  'title-require': false,
  'attr-value-double-quotes': false,
  ...(isPhp
    ? {
        'spec-char-escape': false,
      }
    : {}),
}
