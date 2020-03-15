// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
let content = ""
let tmplIds = '0n7TnraFfEtJVLnZfsOttZHdTefGaJowe2K5VHthX44' //消息订阅模板的id
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    loginShow: false, //登录组件是否显示
    modalShow: false, //底部弹出框是否显示
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                this.setData({
                  modalShow: true
                })
              },
            })
          } else {
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },
    onLoginsuccess(event) {
      userInfo = event.datail
      this.setData({
        loginShow: false
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },
    onLoginfail() {
      wx.showModal({
        title: '授权用户才能进行评价',
      })
    },
    onInput(event) {
      content = event.detail.value
    },
    onSend() {
      console.log(userInfo)
      // 插入数据库
      if (content.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask: true
      })
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then(res => {
        wx.hideLoading()
        // 推送模板消息
        // 获取授权信息
        wx.showModal({
          title: '是否接受评价状态的推送',
          success: (res) => {
            if (res.confirm) {
              wx.requestSubscribeMessage({
                tmplIds: [tmplIds], //这里填入我们生成的模板id
                success: (res) => {
                  if (res[tmplIds] == "accept") {
                    wx.cloud.callFunction({
                      name: "sendMessage",
                      data: {
                        content,
                        blogId: this.properties.blogId
                      }
                    }).then(res => {
                      console.log("推送消息成功", res)
                    }).catch(res => {
                      console.log("推送消息失败", res)
                    })
                  } else {
                    wx.showToast({
                      title: '拒绝授权将不会推送评论消息到微信',
                    })
                  }

                  wx.showToast({
                    title: '评论成功',
                  })
                  this.setData({
                    modalShow: false,
                    content: ''
                  })
                },
                fail(res) {
                  wx.showToast({
                    title: '评论成功',
                  })
                  this.setData({
                    modalShow: false,
                    content: ''
                  })
                  console.log('授权失败', res)
                }
              })
            } else if (res.cancel) {
              wx.showToast({
                title: '拒绝授权将不会推送评论消息到微信',
              })
              wx.showToast({
                title: '评论成功',
              })
              this.setData({
                modalShow: false,
                content: ''
              })
            }
            // 父元素刷新评论页面
            this.triggerEvent('refreshCommentList')
          }
        })
      })
    },
  }
})