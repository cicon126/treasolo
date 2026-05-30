import React from 'react';
import { View, Text, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTodoStore } from '@/store/todoStore';
import styles from './index.module.scss';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, todos } = useTodoStore();

  const handleReminderToggle = (checked: boolean) => {
    updateSettings({ enableReminder: checked });
    Taro.vibrateShort({ type: 'light' });
  };

  const handleVoiceToggle = (checked: boolean) => {
    updateSettings({ enableVoice: checked });
    Taro.vibrateShort({ type: 'light' });
  };

  const handleClearCompleted = () => {
    Taro.showModal({
      title: '清除已完成',
      content: '确定要清除所有已完成的待办吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '功能开发中', icon: 'none' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <Text className={styles.sectionTitle}>提醒设置</Text>
      <View className={styles.card}>
        <View className={styles.settingItem}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon}>🔔</View>
            <View className={styles.itemInfo}>
              <Text className={styles.itemTitle}>弹窗提醒</Text>
              <Text className={styles.itemDesc}>事项到期前弹出提醒窗口</Text>
            </View>
          </View>
          <Switch
            className={styles.switch}
            checked={settings.enableReminder}
            onChange={(e) => handleReminderToggle(e.detail.value)}
            color="#FF7D00"
          />
        </View>

        <View className={styles.settingItem}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon}>🔊</View>
            <View className={styles.itemInfo}>
              <Text className={styles.itemTitle}>语音播报</Text>
              <Text className={styles.itemDesc}>提醒时语音播报事项内容</Text>
            </View>
          </View>
          <Switch
            className={styles.switch}
            checked={settings.enableVoice}
            onChange={(e) => handleVoiceToggle(e.detail.value)}
            color="#FF7D00"
          />
        </View>
      </View>

      <Text className={styles.sectionTitle}>数据统计</Text>
      <View className={styles.card}>
        <View className={styles.settingItem}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon}>📊</View>
            <View className={styles.itemInfo}>
              <Text className={styles.itemTitle}>总待办数</Text>
              <Text className={styles.itemDesc}>共添加 {todos.length} 条待办</Text>
            </View>
          </View>
          <Text className={styles.itemArrow}>{todos.length}</Text>
        </View>

        <View className={styles.settingItem} onClick={handleClearCompleted}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon}>🧹</View>
            <View className={styles.itemInfo}>
              <Text className={styles.itemTitle}>清除已完成</Text>
              <Text className={styles.itemDesc}>一键清除所有已完成的待办</Text>
            </View>
          </View>
          <Text className={styles.itemArrow}>›</Text>
        </View>
      </View>

      <View className={styles.aboutCard}>
        <Text className={styles.logo}>📅</Text>
        <Text className={styles.appName}>日程记事本</Text>
        <Text className={styles.appVersion}>Version 1.0.0</Text>
        <Text className={styles.appDesc}>
          一款简单易用的日程提醒工具，帮助您管理日常事务，不错过每一个重要时刻。
        </Text>
        <View className={styles.features}>
          <View className={styles.feature}>
            <Text className={styles.featureIcon}>⏰</Text>
            <Text className={styles.featureText}>准时提醒</Text>
          </View>
          <View className={styles.feature}>
            <Text className={styles.featureIcon}>🔊</Text>
            <Text className={styles.featureText}>语音播报</Text>
          </View>
          <View className={styles.feature}>
            <Text className={styles.featureIcon}>💾</Text>
            <Text className={styles.featureText}>本地存储</Text>
          </View>
          <View className={styles.feature}>
            <Text className={styles.featureIcon}>🎨</Text>
            <Text className={styles.featureText}>简洁界面</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;
