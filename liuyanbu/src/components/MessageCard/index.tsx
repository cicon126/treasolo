import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Avatar from '../Avatar';
import { Message, User } from '@/types';

interface MessageCardProps {
  message: Message;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  onUserClick?: (user: User) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  showDelete = false,
  onDelete,
  onUserClick
}) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    Taro.showModal({
      title: '删除确认',
      content: '确定要删除这条留言吗？',
      success: (res) => {
        if (res.confirm && onDelete) {
          onDelete(message.id);
        }
      }
    });
  };

  const handleUserClick = () => {
    if (message.user && onUserClick) {
      onUserClick(message.user);
    }
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Avatar
          src={message.user?.avatar || ''}
          size="medium"
          onClick={handleUserClick}
        />
        <View className={styles.userInfo} onClick={handleUserClick}>
          <Text className={styles.nickname}>{message.user?.nickname || '匿名用户'}</Text>
          <Text className={styles.time}>{message.createdAt}</Text>
        </View>
        {showDelete && (
          <Button className={styles.deleteBtn} onClick={handleDelete}>
            ×
          </Button>
        )}
      </View>
      <View className={styles.content}>{message.content}</View>
    </View>
  );
};

export default MessageCard;
