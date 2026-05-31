export default defineAppConfig({
  pages: [
    'pages/wheel/index',
    'pages/prizes/index',
    'pages/history/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ff6b6b',
    navigationBarTitleText: '幸运大转盘',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#ff6b6b',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/wheel/index',
        text: '抽奖'
      },
      {
        pagePath: 'pages/prizes/index',
        text: '奖品'
      },
      {
        pagePath: 'pages/history/index',
        text: '记录'
      }
    ]
  }
})
