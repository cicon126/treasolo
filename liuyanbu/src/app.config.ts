export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/my-messages/index',
    'pages/profile/index',
    'pages/message-detail/index',
    'pages/edit-profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '留言簿',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#6366f1',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '留言广场'
      },
      {
        pagePath: 'pages/my-messages/index',
        text: '我的留言'
      },
      {
        pagePath: 'pages/profile/index',
        text: '个人中心'
      }
    ]
  }
})
