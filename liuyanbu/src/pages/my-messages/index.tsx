import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import MessageCard from '@/components/MessageCard';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store/useStore';
import { Message } from '@/types';

const MyMessagesPage: React.FC = () => {
  const { messages, currentUser, deleteMessage } = useStore();

  const myMessages = useMemo(() => {
    if (!currentUser) return [];
    return messages.filter(m => m.userId === currentUser.id);
  }, [messages, currentUser]);

  useDidShow(() => {
    console.log('[MyMessagesPage] page show, my messages count:', myMessages.length);
  });

  const handleDelete = useCallback((id: string) => {
    try {
      deleteMessage(id);
      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      });
      console.log('[MyMessagesPage] message deleted', id);
    } catch (err) {
      console.error('[MyMessagesPage] delete error', err);
      Taro.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  }, [deleteMessage]);

  const handleCardClick = useCallback((message: Message) => {
    console.log('[MyMessagesPage] card click', message.id);
    Taro.navigateTo({
      url: `/pages/message-detail/index?id=${message.id}`
    }).catch((err) => {
      console.error('[MyMessagesPage] navigate error', err);
    });
  }, []);

  return (
    <ScrollView
      className={styles.page}
      scrollY
    >
      <View className={styles.header}>
        <Text className={styles.title}>我的留言</Text>
        <Text className={styles.count}>共 {myMessages.length} 条留言</Text>
      </View>

      <View className={styles.list}>
        {myMessages.length === 0 ? (
          <EmptyState text='你还没有发布过留言' icon='✍️' />
        ) : (
          myMessages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              showDelete
              onDelete={handleDelete}
              onClick={handleCardClick}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default MyMessagesPage;
