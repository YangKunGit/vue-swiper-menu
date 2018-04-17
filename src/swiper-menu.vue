<template>
  <div class="swiper-menu" :class="{'swiper-menu-fix-bottom': fixBottom}" ref="viewArea">
    <div class="swiper-menu-list"
         :style="style"
         ref="list">
      <slot></slot>
      <span class="bottom-bar" :style="bottomBarStyle"></span>
    </div>
  </div>
</template>

<script>
import './utils/requestAnimationFrame'

export default {
  name: 'swiper-menu',
  props: {
    lineWidth: {
      type: Number,
      default: 50
    },
    activeColor: {
      type: String,
      default: '#000'
    },
    fixBottom: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number,
      default: 0
    },

    // 近似等于超出边界时最大可拖动距离(px);
    additionalX: {
      type: Number,
      default: 50
    },
    // 惯性回弹指数(值越大，幅度越大，惯性回弹距离越长);
    reBoundExponent: {
      type: Number,
      default: 10
    },
    // 灵敏度(惯性滑动时的灵敏度,值越小，阻力越大),可近似认为速度减为零所需的时间(ms);
    sensitivity: {
      type: Number,
      default: 1000
    },
    // 回弹过程duration;
    reBoundingDuration: {
      type: Number,
      default: 360
    }
  },
  computed: {
    style () {
      return {
        transitionTimingFunction: this.transitionTimingFunction,
        transitionDuration: `${this.transitionDuration}ms`,
        transform: `translate3d(${this.translateX}px, 0px, 0px)`
      }
    },
    transitionDuration () {
      if (this.isClick) {
        return this.reBoundingDuration
      }
      if (this.touching || (!this.reBounding && !this.touching)) {
        return '0'
      }
      if (this.reBounding && !this.touching) {
        return this.reBoundingDuration
      }
    },
    transitionTimingFunction () {
      return this.reBounding ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'cubic-bezier(0.1, 0.57, 0.1, 1)'
    },
    // 可视区宽度;
    viewAreaWidth () {
      return this.$refs.viewArea.offsetWidth
    },
    // 可视区与可滑动元素宽度差值;
    listWidth () {
      return this.$refs.list.offsetWidth - this.viewAreaWidth
    },
    // 是否向左惯性滚动;
    isMoveLeft () {
      return this.currentX <= this.startX
    },
    isMoveRight () {
      return this.currentX >= this.startX
    }
  },
  data () {
    return {
      speed: 0, // 滑动速度(正常滑动时一般不会超过10);
      touching: false, // 是否处于touch状态;
      reBounding: false, // 是否处于回弹过程;
      translateX: 0,
      startX: 0,
      lastX: 0,
      currentX: 0,
      frameTime: 16.7, // 每个动画帧的ms数
      frameStartTime: 0,
      frameEndTime: 0,
      inertiaFrame: 0,
      zeroSpeed: 0.001, // 当speed绝对值小于该值时认为速度为0 (可用于控制惯性滚动结束期的顺滑度)
      acceleration: 0, // 惯性滑动加速度;
      isClick: true,
      bottomBarStyle: {},
      currentIndex: 0
    }
  },
  mounted () {
    this.bindEvent()

    setTimeout(() => {
      // this.transformBottomBar(this.value)
      this.slideItemDidClick(this.value, this.$children[this.value].$el)
      this.currentIndex = this.value
    }, 50)
  },
  methods: {
    // start
    handleTouchStart (event) {
      cancelAnimationFrame(this.inertiaFrame)
      this.lastX = event.touches[0].clientX
      this.isClick = true
    },
    // move
    handleTouchMove (event) {
      this.isClick = false
      if (this.listWidth <= 0) return
      event.preventDefault()
      event.stopPropagation()
      this.touching = true
      this.startMoveTime = this.endMoveTime
      this.startX = this.lastX
      this.currentX = event.touches[0].clientX
      this.moveFellowTouch()
      this.endMoveTime = event.timeStamp // 每次触发touchmove事件的时间戳;
    },
    // end
    handleTouchEnd (event) {
      if (!this.touching) return
      if (this.checkReboundX()) {
        cancelAnimationFrame(this.inertiaFrame)
      } else {
        let silenceTime = event.timeStamp - this.endMoveTime
        let timeStamp = this.endMoveTime - this.startMoveTime
        if (silenceTime > 100) return  // 停顿时间超过100ms不产生惯性滑动;
        this.speed = (this.lastX - this.startX) / (timeStamp)
        this.acceleration = this.speed / this.sensitivity
        this.frameStartTime = new Date().getTime()
        this.inertiaFrame = requestAnimationFrame(this.moveByInertia)
      }
      this.touching = false
    },
    // 如果需要回弹则进行回弹操作并返回true;
    checkReboundX () {
      this.reBounding = false
      if (this.translateX > 0) {
        this.reBounding = true
        this.translateX = 0
      } else if (this.translateX < -this.listWidth) {
        this.reBounding = true
        this.translateX = -this.listWidth
      }
      return this.translateX === 0 || this.translateX === -this.listWidth
    },
    bindEvent () {
      this.$el.addEventListener('touchstart', this.handleTouchStart, false)
      this.$el.addEventListener('touchmove', this.handleTouchMove, false)
      this.$el.addEventListener('touchend', this.handleTouchEnd, false)
    },
    // touch拖动
    moveFellowTouch () {
      if (this.isMoveLeft) { // 向左拖动
        if (this.translateX <= 0 && this.translateX + this.listWidth > 0 || this.translateX > 0) {
          this.translateX += this.currentX - this.lastX
        } else if (this.translateX + this.listWidth <= 0) {
          this.translateX += this.additionalX * (this.currentX - this.lastX) / (this.viewAreaWidth + Math.abs(this.translateX + this.listWidth))
        }
      } else { // 向右拖动
        if (this.translateX >= 0) {
          this.translateX += this.additionalX * (this.currentX - this.lastX) / (this.viewAreaWidth + this.translateX)
        } else if (this.translateX <= 0 && this.translateX + this.listWidth >= 0 || this.translateX + this.listWidth <= 0) {
          this.translateX += this.currentX - this.lastX
        }
      }
      this.lastX = this.currentX
    },
    // 惯性滑动
    moveByInertia () {
      this.frameEndTime = new Date().getTime()
      this.frameTime = this.frameEndTime - this.frameStartTime
      if (this.isMoveLeft) { // 向左惯性滑动;
        if (this.translateX <= -this.listWidth) { // 超出边界的过程;
          // 加速度指数变化;
          this.acceleration *= (this.reBoundExponent +
                               Math.abs(this.translateX + this.listWidth)) /
                               this.reBoundExponent
          this.speed = Math.min(this.speed - this.acceleration, 0) // 为避免减速过程过短，此处加速度没有乘上frameTime;
        } else {
          this.speed = Math.min(this.speed - this.acceleration * this.frameTime, 0)
        }
      } else if (this.isMoveRight) { // 向右惯性滑动;
        if (this.translateX >= 0) {
          this.acceleration *= (this.reBoundExponent + this.translateX) / this.reBoundExponent
          this.speed = Math.max(this.speed - this.acceleration, 0)
        } else {
          this.speed = Math.max(this.speed - this.acceleration * this.frameTime, 0)
        }
      }
      this.translateX += this.speed * this.frameTime / 2
      if (Math.abs(this.speed) <= this.zeroSpeed) {
        this.checkReboundX()
        return
      }
      this.frameStartTime = this.frameEndTime
      this.inertiaFrame = requestAnimationFrame(this.moveByInertia)
    },
    slideItemDidClick (index, item) {
      if (!this.isClick) return
      this.currentIndex = index
      const totalW = this.$refs.list.offsetWidth
      const screenLeft = item.getBoundingClientRect().left
      const itemCenterX = screenLeft + item.clientWidth / 2
      if (itemCenterX !== document.body.clientWidth / 2) {
        let translateX = this.translateX - (itemCenterX - document.body.clientWidth / 2)
        const maxTranslateX = -totalW + document.body.clientWidth
        if (translateX > 0) {
          translateX = 0
        } else if (translateX < maxTranslateX) {
          translateX = maxTranslateX
        }
        this.translateX = translateX
        this.reBounding = true
      }

      this.$emit('input', index)

      this.transformBottomBar(index)
    },
    transformBottomBar (index) {
      let left = 0
      if (this.$children[index]) {
        const dom = this.$children[index].$el
        left = dom.offsetLeft + dom.clientWidth / 2 - this.lineWidth / 2
      }
      this.bottomBarStyle = {
        width: `${this.lineWidth}px`,
        backgroundColor: this.activeColor,
        transitionDuration: `${this.transitionDuration}ms`,
        transform: `translateX(${left}px)`
      }
    }
  }
}
</script>

<style lang="less">
.swiper-menu {
  position: relative;
  background-color: rgb(255, 255, 255, 0.8);
  width: 100%;
  overflow: hidden;
  display: flex;
  border-bottom: 1px solid #ddd;
  &.swiper-menu-item-fix-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #ccc;
    border-bottom: none;
    .swiper-menu-item {
      border-bottom: none !important;
    }
  }
  .swiper-menu-list {
    box-sizing: border-box;
    display: flex;
    flex-flow: row nowrap;
    flex-shrink: 0;
    padding-top: 5px;
    min-width: 100%;
    -webkit-transition: all 0.3s;
    transition: all 0.3s;
    .swiper-menu-item {
      flex-grow: 1;
      font-size: 14px;
      text-align: center;
      padding: 0 10px;
      min-width: 80px;
    }
  }
  .bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    background: #000;
    width: 40px;
    height: 2px;
    transition: all 300ms;
  }
}
</style>
