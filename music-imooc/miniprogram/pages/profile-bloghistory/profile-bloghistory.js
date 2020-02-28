// pages/profile-bloghistory/profile-bloghistory.js
const MAX_LIMIT = 10
const db = wx.cloud.database()
Page({
  data: {
    blogList:[]
  },
  onLoad: function (options) {
    // this._getListByCloudFn()
    this._getListByMiniprogram()
  },
  _getListByCloudFn(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'blog',
      data:{
        start:this.data.blogList.length,
        cound:MAX_LIMIT,
        $url:'getListByOpenid'
      }
    }).then(res=>{
      this.setData({
        blogList:this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
    })
  },
  _getListByMiniprogram(){
    wx.showLoading({
      title: '加载中',
    })
    db.collection('blog').skip(this.data.blogList.length)
    .limit(MAX_LIMIT).orderBy('createTime','desc').get().then(res=>{
      let _bloglist = res.data
      for(let i=0,len=_bloglist.length;i<len;i++){
        _bloglist[i].createTime = _bloglist[i].createTime.toString()
      }
      this.setData({
        blogList:this.data.blogList.concat(_bloglist)
      })
      wx.hideLoading()
    })
  },
  goComment(event) {
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // this._getListByCloudFn()
    this._getListByMiniprogram()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    const blog = event.target.dataset.blog
    return {
      title:blog.content,
      path:`/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})