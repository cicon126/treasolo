import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { RecipeProvider } from './store/recipeContext';
import './app.scss';

function App(props) {
  useEffect(() => {});

  useDidShow(() => {});

  useDidHide(() => {});

  return (
    <RecipeProvider>
      {props.children}
    </RecipeProvider>
  );
}

export default App;
