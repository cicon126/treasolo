import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { LocationData } from '../../types/location';
import { getHistory, clearHistory, setCurrentLocation } from '../../store/locationStore';
import { formatLatLng } from '../../utils/geocode';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<LocationData[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const latestHistory = getHistory();
      if (JSON.stringify(latestHistory) !== JSON.stringify(history)) {
        setHistory(latestHistory);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [history]);

  const loadHistory = () => {
    const data = getHistory();
    setHistory(data);
    console.log('[HistoryPage] 加载历史记录', data.length);
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  };

  const getTypeText = (type: string): string => {
    return type === 'latlng-to-address' ? '经纬度转地址' : '地址转经纬度';
  };

  const getTypeIcon = (type: string): string => {
    return type === 'latlng-to-address' ? '📍' : '🔍';
  };

  const handleViewMap = (item: LocationData) => {
    setCurrentLocation(item);
    console.log('[HistoryPage] 查看地图', item);
    Taro.switchTab({
      url: '/pages/map/index'
    });
  };

  const handleGoToConvert = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    });
  };

  const handleClearHistory = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          clearHistory();
          setHistory([]);
          Taro.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1500
          });
          console.log('[HistoryPage] 清空历史记录');
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.title}>历史记录</View>
        {history.length > 0 && (
          <Button className={styles.clearBtn} onClick={handleClearHistory}>
            清空
          </Button>
        )}
      </View>

      {history.length > 0 ? (
        <ScrollView scrollY className={styles.list}>
          {history.map((item) => (
            <View key={item.id} className={styles.itemCard}>
              <View className={styles.itemHeader}>
                <View className={styles.itemType}>
                  <Text className={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
                  <Text className={styles.typeBadge}>{getTypeText(item.type)}</Text>
                </View>
                <View className={styles.itemTime}>{formatTime(item.timestamp)}</View>
              </View>

              <View className={styles.itemContent}>
                <View className={styles.itemRow}>
                  <View className={styles.itemLabel}>经纬度</View>
                  <View className={styles.itemValue}>
                    <Text className={styles.coordText}>
                      {formatLatLng(item.latitude, item.longitude)}
                    </Text>
                  </View>
                </View>
                <View className={styles.itemRow}>
                  <View className={styles.itemLabel}>地址</View>
                  <View className={styles.itemValue}>{item.address}</View>
                </View>
              </View>

              <View className={styles.itemFooter}>
                <Button
                  className={classnames(styles.footerBtn, styles.primary)}
                  onClick={() => handleViewMap(item)}
                >
                  查看地图
                </Button>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>📋</View>
          <View className={styles.emptyText}>
            暂无历史记录
            <Text>\n快去转换一个坐标吧</Text>
          </View>
          <Button className={styles.emptyBtn} onClick={handleGoToConvert}>
            去转换坐标
          </Button>
        </View>
      )}

      {history.length > 0 && (
        <View className={styles.bottomBar}>
          <Button
            className={classnames(styles.bottomBtn, styles.danger)}
            onClick={handleClearHistory}
          >
            清空记录
          </Button>
          <Button
            className={classnames(styles.bottomBtn, styles.primary)}
            onClick={handleGoToConvert}
          >
            去转换坐标
          </Button>
        </View>
      )}
    </View>
  );
};

export default HistoryPage;
