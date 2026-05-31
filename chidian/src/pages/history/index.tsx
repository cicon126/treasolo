import React, { useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDictionaryStore } from '@/store/dictionary';
import { searchWords } from '@/utils/dictionary';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const HistoryPage: React.FC = () => {
  const { searchHistory, clearSearchHistory, addSearchHistory } = useDictionaryStore();

  const handleItemClick = useCallback((keyword: string) => {
    console.info('[History] Re-searching:', keyword);
    addSearchHistory(keyword);
    const results = searchWords(keyword);
    if (results.length > 0) {
      Taro.switchTab({ url: '/pages/home/index' });
    } else {
      Taro.showToast({
        title: '未找到相关词汇',
        icon: 'none'
      });
    }
  }, [addSearchHistory]);

  const handleClear = useCallback(() => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空所有查询历史吗？',
      success: (res) => {
        if (res.confirm) {
          clearSearchHistory();
          Taro.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  }, [clearSearchHistory]);

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.headerRow}>
        <Text className={styles.headerTitle}>查询历史</Text>
        {searchHistory.length > 0 && (
          <View className={styles.clearBtn} onClick={handleClear}>
            <Text className={styles.clearBtnText}>清空</Text>
          </View>
        )}
      </View>

      {searchHistory.length > 0 ? (
        <View className={styles.historyList}>
          {searchHistory.map((item) => (
            <View
              key={item.id}
              className={styles.historyItem}
              onClick={() => handleItemClick(item.keyword)}
            >
              <View className={styles.historyLeft}>
                <Text className={styles.historyIcon}>🕐</Text>
                <Text className={styles.historyKeyword}>{item.keyword}</Text>
                <Text className={styles.historyTime}>
                  {dayjs(item.timestamp).format('HH:mm')}
                </Text>
              </View>
              <Text className={styles.historyArrow}>›</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📝</Text>
          <Text className={styles.emptyText}>暂无查询历史</Text>
          <Text className={styles.emptyHint}>在首页搜索词汇后会自动记录</Text>
        </View>
      )}

      <View className={styles.bottomSpace} />
    </ScrollView>
  );
};

export default HistoryPage;
