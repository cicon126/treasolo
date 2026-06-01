import Taro from '@tarojs/taro';
import { LocationData } from '../types/location';

const STORAGE_KEY = 'location_history';
const CURRENT_LOCATION_KEY = 'current_location';

export const saveToHistory = (data: LocationData): void => {
  try {
    const history = getHistory();
    const existIndex = history.findIndex(item => item.id === data.id);
    if (existIndex > -1) {
      history.splice(existIndex, 1);
    }
    history.unshift(data);
    if (history.length > 50) {
      history.pop();
    }
    Taro.setStorageSync(STORAGE_KEY, history);
    console.log('[LocationStore] 保存历史记录成功', data);
  } catch (error) {
    console.error('[LocationStore] 保存历史记录失败', error);
  }
};

export const getHistory = (): LocationData[] => {
  try {
    const history = Taro.getStorageSync(STORAGE_KEY);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('[LocationStore] 获取历史记录失败', error);
    return [];
  }
};

export const clearHistory = (): void => {
  try {
    Taro.removeStorageSync(STORAGE_KEY);
    console.log('[LocationStore] 清空历史记录成功');
  } catch (error) {
    console.error('[LocationStore] 清空历史记录失败', error);
  }
};

export const setCurrentLocation = (data: LocationData | null): void => {
  try {
    if (data) {
      Taro.setStorageSync(CURRENT_LOCATION_KEY, data);
    } else {
      Taro.removeStorageSync(CURRENT_LOCATION_KEY);
    }
    console.log('[LocationStore] 设置当前位置', data);
  } catch (error) {
    console.error('[LocationStore] 设置当前位置失败', error);
  }
};

export const getCurrentLocation = (): LocationData | null => {
  try {
    const data = Taro.getStorageSync(CURRENT_LOCATION_KEY);
    return data || null;
  } catch (error) {
    console.error('[LocationStore] 获取当前位置失败', error);
    return null;
  }
};
