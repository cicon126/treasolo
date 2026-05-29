export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/customers/index',
    'pages/followups/index',
    'pages/statistics/index',
    'pages/customer-detail/index',
    'pages/customer-edit/index',
    'pages/followup-edit/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '客户管理',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f7fa',
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/customers/index',
        text: '客户',
      },
      {
        pagePath: 'pages/followups/index',
        text: '跟进',
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计',
      },
    ],
  },
});
