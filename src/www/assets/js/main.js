import init from '~/core'

// import WithComponent from '~/highway/WithComponent'

// scroll
// import Scroll from '~/scroll/Scroll'
import Scroll from '~/scroll/ScrollLocomotive'

// permanent components
// import CHeader from '~/components/cHeader'

// functions
import AnchorLink from '~/functions/AnchorLink'
import ModalTrigger from '~/functions/ModalTrigger'
// import ScrollFixed from '~/functions/ScrollFixed'
// import ScrollSticky from '~/functions/ScrollSticky'

// components
// import CModal from '~/components/cModal'

//
// main
//

init({
  Scroll,
  permanentComponents: [
    // CHeader,
  ],
  components: [
    AnchorLink,
    ModalTrigger,
    // ScrollFixed,
    // ScrollSticky,
    // CModal,
  ],
  // transitions: {
  //   default: WithComponent,
  //   // contextual: {
  //   //   menu: WithComponent, // メニュー内リンククリック時のアニメーション
  //   // },
  // },
})
