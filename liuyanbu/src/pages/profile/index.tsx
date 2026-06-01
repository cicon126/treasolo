import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store/useStore';

const ProfilePage: React.FC = () => {
  const { currentUser, messages } = useStore();

  const myMessageCount = useMemo(() => {
    if (!currentUser) return 0;
    return messages.filter(m => m.userId === currentUser.id).length;
  }, [messages, currentUser]);

  useDidShow(() => {
    console.log('[ProfilePage] page show, user:', currentUser?.nickname);
  });

  const handleEditProfile = useCallback(() => {
    console.log('[ProfilePage] edit profile clicked');
    Taro.navigateTo({
      url: '/pages/edit-profile/index'
    }).catch((err) => {
      console.error('[ProfilePage] navigate error', err);
    });
  }, []);

  const handleMenuItemClick = useCallback((type: string) => {
    console.log('[ProfilePage] menu click', type);
    if (type === 'edit') {
      handleEditProfile();
    } else {
      Taro.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  }, [handleEditProfile]);

  if (!currentUser) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.nickname}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Image
          className={styles.avatar}
          src={currentUser.avatar}
          mode='aspectFill'
          onError={(e) => {
            console.error('[ProfilePage] avatar load error', e);
          }}
        />
        <Text className={styles.nickname}>{currentUser.nickname}</Text>
        <Text className={styles.bio}>{currentUser.bio || '这个人很懒，什么都没写'}</Text>
        <Button
          className={styles.editBtn}
          onClick={handleEditProfile}
        >
          编辑资料
        </Button>
      </View>

      <View className={styles.content}>
        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{myMessageCount}</Text>
            <Text className={styles.statLabel}>我的留言</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{messages.length}</Text>
            <Text className={styles.statLabel}>总留言数</Text>
          </View>
        </View>

        <View className={styles.menuCard}>
          <View
            className={styles.menuItem}
            onClick={() => handleMenuItemClick('edit')}
          >
            <View className={styles.menuIcon}>👤</View>
            <Text className={styles.menuText}>编辑资料</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => handleMenuItemClick('privacy')}
          >
            <View className={styles.menuIcon}>🔒</View>
            <Text className={styles.menuText}>隐私设置</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => handleMenuItemClick('about')}
          >
            <View className={styles.menuIcon}>ℹ️</View>
            <Text className={styles.menuText}>关于我们</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfilePage;
