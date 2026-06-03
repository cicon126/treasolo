import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Avatar from '@/components/Avatar';
import MessageCard from '@/components/MessageCard';
import { User, Message } from '@/types';
import { getCurrentUser, getMessages, deleteMessage } from '@/store/userStore';

const MinePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myMessages, setMyMessages] = useState<Message[]>([]);

  const loadData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    const allMessages = getMessages();
    const userMessages = allMessages.filter(msg => msg.userId === user.id);
    setMyMessages(userMessages);
    
    console.log('[MinePage] Loaded user:', user.nickname, ', messages:', userMessages.length);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(loadData, 1000);
    return () => clearInterval(timer);
  }, []);

  const goToEditProfile = () => {
    Taro.navigateTo({
      url: '/pages/edit-profile/index'
    });
  };

  const handleDelete = (id: string) => {
    const success = deleteMessage(id);
    if (success) {
      setMyMessages(prev => prev.filter(msg => msg.id !== id));
      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }
  };

  const handleUserClick = (user: User) => {
    Taro.navigateTo({
      url: `/pages/user-detail/index?userId=${user.id}`
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}></View>

      <View className={styles.profileCard} onClick={goToEditProfile}>
        <View className={styles.avatarWrapper}>
          <Avatar src={currentUser?.avatar || ''} size="large" />
          <View className={styles.editIcon}>✎</View>
        </View>
        <View className={styles.userInfo}>
          <Text className={styles.nickname}>{currentUser?.nickname || '匿名用户'}</Text>
          <Text className={styles.bio}>{currentUser?.bio || '这个人很懒，什么都没写...'}</Text>
        </View>
        <Text className={styles.arrow}>›</Text>
      </View>

      <Button className={styles.editBtn} onClick={goToEditProfile}>
        编辑资料
      </Button>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我的数据</Text>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.number}>{myMessages.length}</Text>
            <Text className={styles.label}>留言数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.number}>{currentUser?.createdAt || '-'}</Text>
            <Text className={styles.label}>加入时间</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我的留言</Text>
        <View className={styles.myMessages}>
          {myMessages.length === 0 ? (
            <View className={styles.empty}>
              <Text>还没有发布过留言</Text>
            </View>
          ) : (
            myMessages.map(message => (
              <MessageCard
                key={message.id}
                message={message}
                showDelete={true}
                onDelete={handleDelete}
                onUserClick={handleUserClick}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
