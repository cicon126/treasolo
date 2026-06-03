import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Avatar from '@/components/Avatar';
import MessageCard from '@/components/MessageCard';
import { User, Message } from '@/types';
import { getUserById, mockUsers } from '@/data/users';
import { getMessages } from '@/store/userStore';

const UserDetailPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userMessages, setUserMessages] = useState<Message[]>([]);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const userId = currentPage?.options?.userId || '1';
    
    console.log('[UserDetail] UserId from params:', userId);
    
    let foundUser = getUserById(userId);
    if (!foundUser) {
      const allMessages = getMessages();
      const msgWithUser = allMessages.find(m => m.userId === userId && m.user);
      if (msgWithUser?.user) {
        foundUser = msgWithUser.user;
      } else {
        foundUser = mockUsers[0];
      }
    }
    
    setUser(foundUser);
    
    const allMessages = getMessages();
    const messages = allMessages.filter(msg => msg.userId === userId);
    setUserMessages(messages);
    
    console.log('[UserDetail] Loaded user:', foundUser?.nickname, ', messages:', messages.length);
  }, []);

  const handleUserClick = (clickedUser: User) => {
    if (clickedUser.id !== user?.id) {
      Taro.redirectTo({
        url: `/pages/user-detail/index?userId=${clickedUser.id}`
      });
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}></View>

      <View className={styles.userCard}>
        <Avatar src={user?.avatar || ''} size="large" />
        <Text className={styles.nickname}>{user?.nickname || '匿名用户'}</Text>
        <Text className={styles.bio}>{user?.bio || '这个人很神秘，什么都没留下...'}</Text>
        
        <View className={styles.meta}>
          <View className={styles.metaItem}>
            <Text className={styles.label}>留言数</Text>
            <Text className={styles.value}>{userMessages.length}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.label}>加入时间</Text>
            <Text className={styles.value}>{user?.createdAt || '-'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>TA的留言</Text>
        <View className={styles.messages}>
          {userMessages.length === 0 ? (
            <View className={styles.empty}>
              <Text>TA还没有发布过留言</Text>
            </View>
          ) : (
            userMessages.map(message => (
              <MessageCard
                key={message.id}
                message={message}
                showDelete={false}
                onUserClick={handleUserClick}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default UserDetailPage;
