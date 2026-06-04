import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useHealthStore } from '@/store/useHealthStore';
import { calcBMI, getBMIStatus } from '@/utils/healthCalculator';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { profile, records, updateProfile } = useHealthStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [editingHeight, setEditingHeight] = useState(false);
  const [heightInput, setHeightInput] = useState(profile.height.toString());

  const latestRecord = records[0];
  const bmi = latestRecord?.weight ? calcBMI(latestRecord.weight, profile.height) : null;
  const bmiStatus = bmi ? getBMIStatus(bmi) : null;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateProfile({ name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const handleSaveHeight = () => {
    const h = parseInt(heightInput);
    if (h > 0 && h < 300) {
      updateProfile({ height: h });
    }
    setEditingHeight(false);
  };

  const toggleReminder = () => {
    updateProfile({ reminderEnabled: !profile.reminderEnabled });
    Taro.showToast({
      title: profile.reminderEnabled ? '已关闭提醒' : '已开启提醒',
      icon: 'none'
    });
  };

  const menuItems = [
    { icon: '🎯', label: '健康目标', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '📊', label: '数据导出', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '📖', label: '健康知识', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '💬', label: '意见反馈', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.profileCard}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>{profile.name.charAt(0)}</Text>
        </View>
        <View className={styles.profileInfo}>
          <Text className={styles.profileName}>{profile.name}</Text>
          <Text className={styles.profileDesc}>
            {profile.gender === 'male' ? '男' : '女'} · {profile.age}岁 · {profile.height}cm
            {bmi && ` · BMI ${bmi}`}
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>个人信息</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>昵称</Text>
            {editingName ? (
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  style={{ fontSize: '28rpx', textAlign: 'right', width: '200rpx' }}
                  value={nameInput}
                  onInput={(e) => setNameInput(e.detail.value)}
                  onBlur={handleSaveName}
                  autoFocus
                />
              </View>
            ) : (
              <Text className={styles.infoValue} onClick={() => { setEditingName(true); setNameInput(profile.name); }}>
                {profile.name} ✏️
              </Text>
            )}
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>性别</Text>
            <Text className={styles.infoValue}>{profile.gender === 'male' ? '男' : '女'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>年龄</Text>
            <Text className={styles.infoValue}>{profile.age}岁</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>身高</Text>
            {editingHeight ? (
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  style={{ fontSize: '28rpx', textAlign: 'right', width: '200rpx' }}
                  type="digit"
                  value={heightInput}
                  onInput={(e) => setHeightInput(e.detail.value)}
                  onBlur={handleSaveHeight}
                  autoFocus
                />
              </View>
            ) : (
              <Text className={styles.infoValue} onClick={() => { setEditingHeight(true); setHeightInput(profile.height.toString()); }}>
                {profile.height}cm ✏️
              </Text>
            )}
          </View>
          {bmi && bmiStatus && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>BMI</Text>
              <Text className={styles.infoValue} style={{ color: bmiStatus.color }}>
                {bmi}（{bmiStatus.label}）
              </Text>
            </View>
          )}
          {profile.targetWeight && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>目标体重</Text>
              <Text className={styles.infoValue}>{profile.targetWeight}kg</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>功能</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={toggleReminder}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🔔</Text>
              <Text className={styles.menuLabel}>每日提醒</Text>
            </View>
            <View className={styles.toggleWrap}>
              <View className={classnames(styles.toggle, profile.reminderEnabled && styles.toggleActive)}>
                <View className={classnames(styles.toggleDot, profile.reminderEnabled && styles.toggleDotActive)} />
              </View>
            </View>
          </View>
          {menuItems.map((item, i) => (
            <View key={i} className={styles.menuItem} onClick={item.action}>
              <View className={styles.menuLeft}>
                <Text className={styles.menuIcon}>{item.icon}</Text>
                <Text className={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.aboutCard}>
        <Text className={styles.aboutTitle}>健康管理</Text>
        <Text className={styles.aboutDesc}>关注每日健康，记录关键指标{'\n'}科学管理，健康生活每一天</Text>
      </View>
    </View>
  );
};

export default MinePage;
