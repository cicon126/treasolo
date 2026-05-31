export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/edit/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTitleText: '菜谱管理',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '菜谱'
      },
      {
        pagePath: 'pages/category/index',
        text: '分类'
      }
    ]
  }
})
