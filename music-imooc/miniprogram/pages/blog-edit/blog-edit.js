// pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM = 140 // 输入文字最大的个数
const MAX_IMG_NUM = 9 // 最大上传图片数量
const db = wx.cloud.database()
let content = '' //输入的文字内容
let userInfo = {}
Page({
  data: {
    wordsNum: 0, //输入文字的个数
    footerBottom: 0,
    images: [],
    selectPhoto: true //添加图片元素是否正在显示
  },
  onLoad: function (options) {
    userInfo = options
  },
  // 输入的时候控制输入的字数
  onInput(event) {
    let wordsNum = event.detail.value.length
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  // 软键盘弹起的时候控制底部的高度
  onFocus(event) {
    this.setData({
      footerBottom: event.detail.height
    })
  },
  onBlur() {
    this.setData({
      footerBottom: 0
    })
  },
  // 选择照片
  onChooseImage() {
    // 还能再选几张图片
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      }
    })
  },
  // 删除图片
  onDelImage(event) {
    this.data.images.splice(event.target.dataset.index, 1) //删除对应照片
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length == MAX_IMG_NUM - 1) {
      // 图片个数等于8，显示增加图片框
      this.setData({
        selectPhoto: true
      })
    }
  },
  // 预览照片
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },
  // 发布
  send() {
    // 2、数据 -> 云数据库
    // 数据库：内容、图片fileID、openid、昵称、头像、时间
    // 1、图片 -> 云存储 fileID 云文件ID
    if (content.trim() == '') {
      wx.showModal({
        title: '请输入内容'
      })
      return
    }

    wx.showLoading({
      title: '发布中',
      mask: true
    })

    let promiseArr = []
    let fileIds = []
    for (let i = 0, len = this.data.images.length; i < len; i++) {
      let p = new Promise((resolve, reject)=>{
        let item = this.data.images[i]
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            // console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (res) => {
            console.log(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    // 存入到云数据库
    Promise.all(promiseArr).then(res=>{
      db.collection('blog').add({
        data:{
          ...userInfo,
          content,
          img:fileIds,
          createTime:db.serverDate()//服务端的时间
        }
      }).then(res=>{
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })

        // 返回blog页面，并且刷新
        wx.navigateBack()
        const pages = getCurrentPages()
        console.log(pages)
        const prevPage = pages[pages.length-2]
        prevPage.onPullDownRefresh()//调用父页面的方法
      })
    }).catch(err=>{
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})