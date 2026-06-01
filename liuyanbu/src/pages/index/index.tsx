import React, { useState, useCallback } from 'react';
import { View, Text, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import MessageCard from '@/components/MessageCard';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store/useStore';
import { Message } from '@/types';

const IndexPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { messages, currentUser, addMessage } = useStore();

  useDidShow(() => {
    console.log('[IndexPage] page show, messages count:', messages.length);
  });

  const handlePublish = useCallback(() => {
    if (!content.trim()) {
      Taro.showToast({
        title: '请输入留言内容',
        icon: 'none'
      });
      return;
    }

    if (!currentUser) {
      Taro.showToast({
        title: '用户信息异常',
        icon: 'none'
      });
      return;
    }

    setSubmitting(true);

    try {
      const newMessage: Message = {
        id: `m_${Date.now()}`,
        userId: currentUser.id,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        user: currentUser
      };

      addMessage(newMessage);
      setContent('');

      Taro.showToast({
        title: '发布成功',
        icon: 'success'
      });

      console.log('[IndexPage] message published', newMessage);
    } catch (err) {
      console.error('[IndexPage] publish error', err);
      Taro.showToast({
        title: '发布失败',
        icon: 'none'
      });
    } finally {
      setSubmitting(false);
    }
  }, [content, currentUser, addMessage]);

  const handleCardClick = useCallback((message: Message) => {
    console.log('[IndexPage] card click', message.id);
    Taro.navigateTo({
      url: `/pages/message-detail/index?id=${message.id}`
    }).catch((err) => {
      console.error('[IndexPage] navigate error', err);
    });
  }, []);

  const handlePullDownRefresh = useCallback(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 500);
  }, []);

  React.useEffect(() => {
    Taro.onPullDownRefresh(handlePullDownRefresh);
    return () => {
      Taro.offPullDownRefresh(handlePullDownRefresh);
    };
  }, [handlePullDownRefresh]);

  return (
    <ScrollView
      className={styles.page}
      scrollY
    >
      <View className={styles.header}>
        <Text className={styles.title}>留言簿</Text>
        <Text className={styles.subtitle}>分享你的想法，与大家交流</Text>
      </View>

      <View className={styles.publishCard}>
        <Textarea
          className={styles.input}
          placeholder='写下你的留言...'
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          maxlength={500}
          autoHeight
        />
        <View className={styles.buttonRow}>
          <Button
            className={styles.publishBtn}
            onClick={handlePublish}
            disabled={submitting || !content.trim()}
          >
            {submitting ? '发布中...' : '发布'}
          </Button>
        </View>
      </View>

      <View className={styles.list}>
        {messages.length === 0 ? (
          <EmptyState text='还没有留言，快来发布第一条吧！' />
        ) : (
          messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onClick={handleCardClick}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default IndexPage;
