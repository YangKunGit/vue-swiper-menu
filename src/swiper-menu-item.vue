<template>
  <a class="swiper-menu-item"
       @click="onItemClicked"
      ref="item"
  >
    <div class="swiper-menu-item-icon"><slot name="icon"></slot></div>
    <div :style="selected" class="swiper-menu-item-label"><slot></slot></div>
  </a>
</template>

<script>
export default {
  name: 'swiper-menu-item',
  data () {
    return {
      id: (this.$parent.$children.length || 1) - 1
    }
  },
  computed: {
    selected () {
      if (this.$parent.currentIndex == this.id) {
        return {
          color: this.$parent.activeColor
        }
      } else {
        return {
          color: 'rgb(153, 153, 153)'
        }
      }
    }
  },
  methods: {
    onItemClicked () {
      this.$parent.slideItemDidClick(this.id, this.$refs.item)
    }
  }
}
</script>

<style lang="less">
.swiper-menu-item {
  text-decoration: none;
  text-align: center;
  .swiper-menu-item-icon {
    margin: 0 auto 5px;
  }
  .swiper-menu-item-label {
    margin: 0 auto 10px;
    line-height: 18px;
    color: rgb(153, 153, 153);
  }
}
</style>
