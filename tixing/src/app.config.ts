export default defineAppConfig({
  pages: [
    'pages/todos/index',
    'pages/add/index',
    'pages/settings/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF7D00',
    navigationBarTitleText: '日程记事本',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF7D00',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/todos/index',
        text: '待办'
      },
      {
        pagePath: 'pages/add/index',
        text: '添加'
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置'
      }
    ]
  }
})
