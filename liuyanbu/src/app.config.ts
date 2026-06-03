export default defineAppConfig({
  pages: [
    'pages/message/index',
    'pages/publish/index',
    'pages/mine/index',
    'pages/user-detail/index',
    'pages/edit-profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#6366f1',
    navigationBarTitleText: '留言簿',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#6366f1',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/message/index',
        text: '留言墙'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
