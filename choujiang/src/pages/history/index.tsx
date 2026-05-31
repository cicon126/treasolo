import React from 'react';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePrizeContext } from '@/store/prizeContext';
import styles from './index.module.scss';

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const HistoryPage: React.FC = () => {
  const { history, clearAllHistory } = usePrizeContext();

  const handleClear = () => {
    if (history.length === 0) return;

    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有中奖记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await clearAllHistory();
            Taro.showToast({ title: '清空成功', icon: 'success' });
          } catch (error) {
            console.error('[HistoryPage] clear error:', error);
            Taro.showToast({ title: '清空失败', icon: 'none' });
          }
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>中奖记录</Text>
        <Button className={styles.clearButton} onClick={handleClear}>
          清空记录
        </Button>
      </View>

      {history.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无中奖记录</Text>
        </View>
      ) : (
        <ScrollView className={styles.list} scrollY>
          {history.map((item, index) => (
            <View key={item.id} className={styles.historyItem}>
              <Image
                className={styles.itemImage}
                src={item.prizeImage}
                mode='aspectFill'
              />
              <View className={styles.itemInfo}>
                <Text className={styles.itemPrize}>{item.prizeName}</Text>
                <Text className={styles.itemTime}>{formatTime(item.createdAt)}</Text>
              </View>
              <Text className={styles.itemIndex}>#{index + 1}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default HistoryPage;
