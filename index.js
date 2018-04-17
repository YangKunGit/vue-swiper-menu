import SwiperMenu from './src/swiper-menu'
import SwiperMenuItem from './src/swiper-menu-item'

const version = '1.0.1'
const install = function (Vue, config = {}) {
  if (install.installed) return

  Vue.component(SwiperMenu.name, SwiperMenu)
  Vue.component(SwiperMenuItem.name, SwiperMenuItem)
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default {
  install,
  version,
  SwiperMenu,
  SwiperMenuItem
}
