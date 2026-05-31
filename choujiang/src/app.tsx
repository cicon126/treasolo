import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { PrizeProvider } from './store/prizeContext';
import './app.scss';

function App(props) {
  useEffect(() => {});

  useDidShow(() => {});

  useDidHide(() => {});

  return <PrizeProvider>{props.children}</PrizeProvider>;
}

export default App;
