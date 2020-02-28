// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(event){
      const userInfo = event.detail.userInfo
      if(userInfo){
        // 允许授权
        this.setData({
          modalShow:false
        })
        this.triggerEvent('loginsuccess',userInfo)
      }else{
        // 拒绝授权
        this.triggerEvent('loginfail')
      }
    }
  }
})
