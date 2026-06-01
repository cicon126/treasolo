import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Message } from '@/types';

interface MessageCardProps {
  message: Message;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  onClick?: (message: Message) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  showDelete = false,
  onDelete,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(message);
    }
  };

  const handleDelete = (e: any) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (onDelete && message.id) {
      Taro.showModal({
        title: '提示',
        content: '确定要删除这条留言吗？',
        success: (res) => {
          if (res.confirm) {
            onDelete(message.id);
          }
        }
      }).catch((err) => {
        console.error('[MessageCard] showModal error', err);
      });
    }
  };

  const formatTime = (dateStr: string) => {
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
  };

  return (
    <View
      className={classnames(styles.card)}
      onClick={handleClick}
    >
      <View className={styles.header}>
        <Image
          className={styles.avatar}
          src={message.user?.avatar}
          mode='aspectFill'
          onError={(e) => {
            console.error('[MessageCard] Image load error', e);
          }}
        />
        <View className={styles.userInfo}>
          <Text className={styles.nickname}>{message.user?.nickname || '匿名用户'}</Text>
          <Text className={styles.time}>{formatTime(message.createdAt)}</Text>
        </View>
        {showDelete && (
          <Button
            className={styles.deleteBtn}
            onClick={handleDelete}
          >
            删除
          </Button>
        )}
      </View>
      <Text className={styles.content}>{message.content}</Text>
    </View>
  );
};

export default MessageCard;
