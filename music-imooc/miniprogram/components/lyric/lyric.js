// components/lyric/lyric.js
let lyricHeight = 0//单条歌词的高度
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false,
    },
    lyric: String,
  },
  observers: {
    lyric(lrc) {
      if(lrc == '暂无歌词'){
        this.setData({
          lrcList:[{
            lrc,
            time:0
          }],
          nowLyricIndex:-1
        })
      }else{
        this._parseLyric(lrc)
      }
    }
  },
  data: {
    lrcList: [],
    nowLyricIndex: 0, // 当前选中的歌词的索引
    scrollTop: 0, // 滚动条滚动的高度
  },
  lifetimes:{
    ready(){
      wx.getSystemInfo({
        success(res) {
          // 求出1rpx的大小res.screenWidth / 750
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },
  methods: {
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      let _lrcList = []
      line.forEach(elem => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time != null) {
          let lrc = elem.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间转换成秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time: time2Seconds
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    },
    // 歌词联动
    update(currentTime) {
      let lrcList = this.data.lrcList
      if (lrcList.length == 0) {
        return
      }
      // 进度条比歌词长的时候
      if(currentTime>lrcList[lrcList.length-1].time){
        if(this.data.nowLyricIndex != -1){
          this.setData({
            nowLyricIndex:-1,
            scrollTop:lrcList.length*lyricHeight
          })
        }
      }
      for (let i = 0, len = lrcList.length; i < len; i++) {
        if (currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i-1,
            scrollTop:(i-1)*lyricHeight
          })
          break
        }
      }
    }
  }
})