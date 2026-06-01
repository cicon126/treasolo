export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/map/index',
    'pages/history/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '经纬度转换',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '坐标转换'
      },
      {
        pagePath: 'pages/map/index',
        text: '地图展示'
      },
      {
        pagePath: 'pages/history/index',
        text: '历史记录'
      }
    ]
  }
})
