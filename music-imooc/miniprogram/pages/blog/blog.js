// pages/blog/blog.js
let keyword = ''
Page({
  data: {
    modalShow:false,//控制底部弹出层是否显示
    blogList:[]
  },
  onSearch(event){
    this.setData({
      blogList:[]
    })
    keyword = event.detail.keyword
    this._loadBlogList()
  },
  onLoad: function (options) {
    this._loadBlogList()
  },
  _loadBlogList(start = 0){
    wx.showLoading({
      title: '拼命加载中',
    })
    wx.cloud.callFunction({
      name:'blog',
      data:{
        keyword,
        start,
        count:10,
        $url:'list'
      }
    }).then(res=>{
      this.setData({
        blogList:this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 发布功能
  onPublish(){
    // 判断用户是否授权
    wx.getSetting({
      success:(res)=>{
        if(res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success:(res)=>{
              this.onLoginSuccess({
                detail:res.userInfo
              })
            }
          })
        }else{
          this.setData({
            modalShow:true
          })
        }
      }
    })
  },
  onLoginSuccess(event){
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },
  onLoginFail(){
    wx.showModal({
      title: '授权用户才能发布',
      content: '',
    })
  },
  goComment(event){
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId='+event.target.dataset.blogid
    })
  },
  onPullDownRefresh:function(){
    this.setData({
      blogList:[]
    })
    this._loadBlogList(0)
  },
  onReachBottom:function(){
    this._loadBlogList(this.data.blogList.length)
  },
  onShareAppMessage:function(event){
    let blogObj = event.target.dataset.blog
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
    }
  }
})