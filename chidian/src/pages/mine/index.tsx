import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDictionaryStore } from '@/store/dictionary';
import { dictionaryData } from '@/data/dictionary';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { vocabularyIds, searchHistory } = useDictionaryStore();

  const handleMenuItemClick = (type: string) => {
    console.info('[Mine] Menu clicked:', type);
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.profileCard}>
        <View className={styles.avatar}>📖</View>
        <View className={styles.profileInfo}>
          <Text className={styles.profileName}>词典爱好者</Text>
          <Text className={styles.profileDesc}>每日一词，点滴进步</Text>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{dictionaryData.length}</Text>
          <Text className={styles.statLabel}>词库总量</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{vocabularyIds.length}</Text>
          <Text className={styles.statLabel}>已收藏</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{searchHistory.length}</Text>
          <Text className={styles.statLabel}>查询次数</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>设置</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleMenuItemClick('notification')}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🔔</Text>
              <Text className={styles.menuLabel}>每日提醒</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuItemClick('font')}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🔤</Text>
              <Text className={styles.menuLabel}>字体大小</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuItemClick('theme')}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🎨</Text>
              <Text className={styles.menuLabel}>主题设置</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>关于</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleMenuItemClick('about')}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>ℹ️</Text>
              <Text className={styles.menuLabel}>关于词典</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuItemClick('feedback')}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>💬</Text>
              <Text className={styles.menuLabel}>意见反馈</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuItemClick('update')}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🔄</Text>
              <Text className={styles.menuLabel}>检查更新</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <Text className={styles.versionText}>英汉词典 v1.0.0</Text>
    </ScrollView>
  );
};

export default MinePage;
