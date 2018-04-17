# vue-swiper-menu
基于Vue的移动端可滑动菜单栏

## Preview
![image](https://github.com/YangKunGit/vue-swiper-menu/blob/master/Apr-17-2018%2004-44-01.gif)

## Use
```javascript
// main.js
  import SwiperMenu from 'SwiperMenu'
  Vue.use(SwiperMenu)
  
// index.vue
  <swiper-menu :value="selected" @input="changeSelected" activeColor="#fc733c">
        <swiper-menu-item v-for="(item, index) in menus" :key="index">
          <span>{{ item }}</span>
        </swiper-menu-item>
      </swiper-menu>
  
```

## API
| 属性           | 说明                                                                                              |  默认  | 是否必传 |
| :------------- | :------------------------------------------------------------------------------------------------ | :--------: | :------: |
| lineWidth       | 底部滚动条线宽                                                       |   50(px)   |    否    |
| value    | 默认选中                                               |   0   |    否    |
| activeColor        | 选中标签颜色                                   |   #000   |    否    |
| additionalX        | 超出边界时最大可拖动距离                                   |   50(px)   |    否    |
| reBoundWxponent        | 惯性回弹指数(值越大, 回弹距离越长)                                   |   50(px)   |    否    |
| sensitivity        | 灵敏度(值越小, 阻力越大)                                   |   1000(ms)   |    否    |
| reBoundingDuration        | 回弹动画时间                                   |   360(ms)   |    否    |
| input       | 选中项改变的函数, 一个参数选中项下标 | 回调函数 |    否   |
