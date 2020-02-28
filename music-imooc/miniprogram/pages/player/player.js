// pages/player/player.js
let musiclist = []
let nowPlayingIndex = 0; // 正在播放歌曲的index
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
Page({
  data: {
    picUrl: '',
    isPlaying: false, //播放状态
    isLyricShow: false, //歌词显示与否
    lyric: '',
    isSame: false, //表示是否是同一首歌
  },
  onLoad: function (options) {
    // console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },
  _loadMusicDetail(musicId) {
    if (musicId == app.getPlayMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
      backgroundAudioManager.stop()
    }
    app.setPlayMusicId(musicId)

    wx.showLoading({
      title: '加载中',
    })
    let music = musiclist[nowPlayingIndex]
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })
    wx.cloud.callFunction({
      name: "music",
      data: {
        musicId,
        $url: 'musicUrl'
      }
    }).then(res => {
      let result = JSON.parse(res.result)
      if (result.data[0].url == null) {
        wx.showToast({
          title: '无权限播放',
        })
      }
      if (!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name

        // 保存播放历史
        this.savePlayHistory()
      }
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()

      // 加载歌词
      wx.cloud.callFunction({
        name: "music",
        data: {
          musicId,
          $url: 'lyric'
        }
      }).then(res => {
        // console.log(res)
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if (lrc) {
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },
  // 切换播放
  togglePlaying() {
    if (this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  // 上一首
  onPrev() {
    nowPlayingIndex--
    // 如果当前是第一首歌曲。上一首则是最后一首
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext() {
    nowPlayingIndex++
    // 如果当前是最后一首歌曲，下一首则是第一首
    if (nowPlayingIndex == musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 切换歌词显示
  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  // 绑定歌词组件滚动
  timeUpdate(event) {
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  // 暂停歌曲播放
  onPause() {
    this.setData({
      isPlaying: false
    })
  },
  onPlay() {
    this.setData({
      isPlaying: true
    })
  },
  // 保存播放历史
  savePlayHistory() {
    const music = musiclist[nowPlayingIndex]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    let bHave = false
    for (let i = 0, len = history.length; i < len; i++) {
      if (history[i].id == music.id) {
        bHave = true
        break
      }
    }
    if (!bHave) {
      history.unshift(music)
      wx.setStorage({
        data: history,
        key: openid,
      })
    }
  }
})