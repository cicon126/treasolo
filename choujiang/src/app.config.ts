export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/prizes/index',
    'pages/records/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B6B',
    navigationBarTitleText: '幸运转盘',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B6B',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '抽奖'
      },
      {
        pagePath: 'pages/prizes/index',
        text: '奖品'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录'
      }
    ]
  }
})
