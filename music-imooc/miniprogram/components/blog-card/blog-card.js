// components/blog-card/blog-card.js
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog:Object
  },
  observers:{
    ['blog.createTime'](val){
      if(val){
        this.setData({
          _createTime:formatTime(new Date(val))
        })
      }
    }
  },
  data: {
    _createTime:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPreviewImage(event){
      const ds = event.target.dataset
      wx.previewImage({
        urls: ds.imgs,
        current:ds.imgsrc
      })
    }
  }
})
