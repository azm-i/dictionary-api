import {
  isIE,
  isFirefox,
  isTablet,
  isMobile,
  isAndroid,
  isWindows,
  isSafari,
  isIos,
} from '~/utils/navigator'

//
// main
//

/* browser */
if (isIE) {
  document.documentElement.classList.add('bIe')
} else if (isFirefox) {
  document.documentElement.classList.add('bFirefox')
} else if (isSafari) {
  document.documentElement.classList.add('bSafari')
}

/* device */
if (isTablet) {
  document.documentElement.classList.add('bTablet')
}

/* OS */
if (isMobile) {
  document.documentElement.classList.add('bMobile')
}
if (isIos) {
  document.documentElement.classList.add('bIos')
} else if (isAndroid) {
  document.documentElement.classList.add('bAndroid')
} else if (isWindows) {
  document.documentElement.classList.add('bWindows')
}
