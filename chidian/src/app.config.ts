export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/vocabulary/index',
    'pages/history/index',
    'pages/mine/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4A6CF7',
    navigationBarTitleText: '英汉词典',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#4A6CF7',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '查询'
      },
      {
        pagePath: 'pages/vocabulary/index',
        text: '词汇本'
      },
      {
        pagePath: 'pages/history/index',
        text: '历史'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
