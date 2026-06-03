import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import MessageCard from '@/components/MessageCard';
import { Message, User } from '@/types';
import { getMessages, deleteMessage } from '@/store/userStore';
import { getCurrentUser } from '@/store/userStore';

const MessagePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const loadMessages = useCallback(() => {
    const msgs = getMessages();
    setMessages(msgs);
    const user = getCurrentUser();
    setCurrentUserId(user.id);
    console.log('[MessagePage] Loaded messages:', msgs.length);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadMessages();
    }, 1000);
    return () => clearInterval(timer);
  }, [loadMessages]);

  const handleDelete = (id: string) => {
    const success = deleteMessage(id);
    if (success) {
      setMessages(prev => prev.filter(msg => msg.id !== id));
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
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>留言墙</Text>
        <Text className={styles.subtitle}>分享你的想法，倾听他人的声音</Text>
      </View>
      
      <ScrollView className={styles.messageList} scrollY>
        {messages.length === 0 ? (
          <View className={styles.empty}>
            <Text>还没有留言，快去发布第一条吧~</Text>
          </View>
        ) : (
          messages.map(message => (
            <MessageCard
              key={message.id}
              message={message}
              showDelete={message.userId === currentUserId}
              onDelete={handleDelete}
              onUserClick={handleUserClick}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default MessagePage;
