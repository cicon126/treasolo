import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePrizeContext } from '@/store/PrizeContext';
import styles from './index.module.scss';

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const RecordsPage: React.FC = () => {
  const { records, clearRecords } = usePrizeContext();

  const handleClear = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有抽奖记录吗？',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          clearRecords();
          Taro.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      {records.length > 0 && (
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{records.length}</Text>
            <Text className={styles.statLabel}>总次数</Text>
          </View>
        </View>
      )}

      <View className={styles.header}>
        <Text className={styles.title}>抽奖记录</Text>
        {records.length > 0 && (
          <View className={styles.clearButton} onClick={handleClear}>
            <Text className={styles.clearButtonText}>清空记录</Text>
          </View>
        )}
      </View>

      {records.length > 0 ? (
        <View className={styles.recordList}>
          {records.map((record, index) => (
            <View key={record.id} className={styles.recordCard}>
              {record.prizeImage ? (
                <Image
                  className={styles.recordImg}
                  src={record.prizeImage}
                  mode="aspectFill"
                />
              ) : (
                <View className={styles.recordIcon}>
                  <Text>🎯</Text>
                </View>
              )}
              <View className={styles.recordInfo}>
                <Text className={styles.recordPrize}>{record.prizeName}</Text>
                <Text className={styles.recordTime}>{formatTime(record.timestamp)}</Text>
              </View>
              <Text className={styles.recordIndex}>#{records.length - index}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无抽奖记录</Text>
        </View>
      )}
    </View>
  );
};

export default RecordsPage;
