const store = (window.sdStore = window.sdStore || {
  designWidthPc: 1600,
  designHeightPc: 964,
  // designWidthSp: 750 / 2,
  designWidthSp: 828 / 2,
  designHeightSp: 1506 / 2,
  breakpoint: 768,
  baseWidthMinPc: 1200,
  pageId: '',
  pageIdPrev: '',
  cScroll: null,
  scrollY: 0, // 現在のスクロールの位置（スムーススクロール有効なときはスムーススクロールの位置、無効なときはブラウザネイティブのスクロール位置）
  scrollYSmooth: 0, // 現在のスムーススクロールの位置
  scrollYNative: 0, // 現在のブラウザネイティブのスクロール位置
  windowHeightInitial: window.innerHeight,
  modals: {},
  isOpenModal: false,
  isOpenModalComplete: false,
  isPageJs: false, // そのページ固有のJSファイルが存在するかどうか
  isTransition: false,
  isTransitioned: false, // 非同期遷移済みかどうか（初期表示じゃないかどうか）
  isLeave: false, // 非同期遷移のページ離脱中かどうか
  isPopstate: false,
  isScrollAnimating: false, // スムーススクロールしているとき
  kgl: null,
  elTransitionContents: document.querySelector('[data-transition-contents]'),
  isActiveTypekit: false,
  isHorizontalScroll: false,
})

export default store
