// pages/profile-playhistory/profile-playhistory.js
const app = getApp()
Page({
  data: {
    musiclist:[]
  },
  onLoad: function (options) {
    const playHistory = wx.getStorageSync(app.globalData.openid)
    if(playHistory.length == 0){
      wx.showModal({
        title: '播放历史为空',
      })
    }else{
      wx.setStorage({
        data: playHistory,
        key: 'musiclist',
      })
      this.setData({
        musiclist:playHistory
      })
    }
  }
})