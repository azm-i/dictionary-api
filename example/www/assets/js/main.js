import init from '~/core'

import TransitionDefault from '~/highway/TransitionDefault'

// scroll
// import Scroll from '~/scroll/Scroll'
import Scroll from '~/scroll/ScrollLocomotive'

// permanent components
import CMenu from '~/components/cMenu'
import CHeader from '~/components/cHeader'
import COrientationAlert from '~/components/cOrientationAlert'
import CBackground from '~/components/cBackground'

// functions
import AnchorLink from '~/functions/AnchorLink'
import ModalTrigger from '~/functions/ModalTrigger'
import Lazy from '~/functions/Lazy'

// components
import CModal from '~/components/cModal'
import CButtonSticky from '~/components/cButtonSticky'

//
// main
//

init({
  Scroll,
  permanentComponents: [CMenu, CHeader, COrientationAlert, CBackground],
  components: [AnchorLink, ModalTrigger, Lazy, CModal, CButtonSticky],
  transitions: {
    default: TransitionDefault,
    contextual: {
      menu: TransitionDefault, // メニュー内リンククリック時のアニメーション
    },
  },
})
