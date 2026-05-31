import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { PrizeProvider } from './store/PrizeContext';
// 全局样式
import './app.scss';

function App(props) {
  // 可以使用所有的 React Hooks
  useEffect(() => {});

  // 对应 onShow
  useDidShow(() => {});

  // 对应 onHide
  useDidHide(() => {});

  return (
    <PrizeProvider>
      {props.children}
    </PrizeProvider>
  );
}

export default App;
