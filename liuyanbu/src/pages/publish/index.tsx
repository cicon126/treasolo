import React, { useState, useEffect } from 'react';
import { View, Text, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Avatar from '@/components/Avatar';
import { User } from '@/types';
import { getCurrentUser, addMessage } from '@/store/userStore';

const PublishPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const maxWords = 500;

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    console.log('[PublishPage] Current user:', user.nickname);
  }, []);

  const wordCount = content.length;

  const handlePublish = () => {
    if (!content.trim()) {
      Taro.showToast({
        title: '请输入留言内容',
        icon: 'none'
      });
      return;
    }

    if (wordCount > maxWords) {
      Taro.showToast({
        title: `留言不能超过${maxWords}字`,
        icon: 'none'
      });
      return;
    }

    try {
      addMessage(content.trim());
      Taro.showToast({
        title: '发布成功',
        icon: 'success'
      });
      setContent('');
      console.log('[PublishPage] Message published successfully');
      
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/message/index'
        });
      }, 1000);
    } catch (error) {
      console.error('[PublishPage] Publish error:', error);
      Taro.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>发布留言</Text>
        <Text className={styles.subtitle}>分享你的想法和感受</Text>
      </View>

      <View className={styles.card}>
        <View className={styles.userInfo}>
          <Avatar src={currentUser?.avatar || ''} size="medium" />
          <Text className={styles.nickname}>{currentUser?.nickname || '匿名用户'}</Text>
        </View>

        <Textarea
          className={styles.textarea}
          placeholder="说点什么吧..."
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          maxlength={maxWords}
          autoHeight
          showConfirmBar={false}
          adjustPosition
        />

        <View className={styles.footer}>
          <Text className={styles.wordCount}>{wordCount}/{maxWords}</Text>
          <Button
            className={styles.publishBtn}
            onClick={handlePublish}
            disabled={!content.trim()}
          >
            发布
          </Button>
        </View>
      </View>
    </View>
  );
};

export default PublishPage;
