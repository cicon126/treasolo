import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useStore } from '@/store/useStore';
import { Message, User } from '@/types';

const MessageDetailPage: React.FC = () => {
  const router = useRouter();
  const messageId = router.params.id;
  const { messages, currentUser, deleteMessage } = useStore();
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    console.log('[MessageDetailPage] init, messageId:', messageId);
    if (!messageId) {
      Taro.showToast({
        title: '参数错误',
        icon: 'none'
      });
      return;
    }

    const found = messages.find(m => m.id === messageId);
    if (found) {
      setMessage(found);
      console.log('[MessageDetailPage] message found:', found.id);
    } else {
      Taro.showToast({
        title: '留言不存在',
        icon: 'none'
      });
    }
  }, [messageId, messages]);

  useDidShow(() => {
    console.log('[MessageDetailPage] page show');
  });

  const handleDelete = useCallback(() => {
    if (!message) return;

    Taro.showModal({
      title: '提示',
      content: '确定要删除这条留言吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            deleteMessage(message.id);
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            });
            setTimeout(() => {
              Taro.navigateBack();
            }, 1000);
            console.log('[MessageDetailPage] message deleted', message.id);
          } catch (err) {
            console.error('[MessageDetailPage] delete error', err);
            Taro.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    }).catch((err) => {
      console.error('[MessageDetailPage] showModal error', err);
    });
  }, [message, deleteMessage]);

  const maskContact = (value: string, isPublic: boolean): string => {
    if (isPublic) return value;
    return '****';
  };

  const formatTime = (dateStr: string) => {
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
  };

  if (!message || !message.user) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const isOwner = currentUser?.id === message.userId;
  const user: User = message.user;

  return (
    <View className={styles.page}>
      <View className={styles.messageCard}>
        <View className={styles.userHeader}>
          <Image
            className={styles.avatar}
            src={user.avatar}
            mode='aspectFill'
            onError={(e) => {
              console.error('[MessageDetailPage] avatar load error', e);
            }}
          />
          <View className={styles.userInfo}>
            <Text className={styles.nickname}>{user.nickname}</Text>
            <Text className={styles.time}>{formatTime(message.createdAt)}</Text>
          </View>
          {isOwner && (
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

      <View className={styles.userProfileCard}>
        <Text className={styles.sectionTitle}>个人资料</Text>

        <View className={styles.bioSection}>
          <Text className={styles.bio}>
            {user.bio || '这个人很懒，什么都没写'}
          </Text>
        </View>

        <View className={styles.contactSection}>
          <Text className={styles.sectionTitle}>联系方式</Text>

          <View className={styles.contactItem}>
            <View className={styles.contactIcon}>📧</View>
            <View className={styles.contactInfo}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text className={styles.contactLabel}>邮箱</Text>
                <Text className={classnames(styles.badge, user.emailPublic ? styles.badgePublic : styles.badgePrivate)}>
                  {user.emailPublic ? '公开' : '隐藏'}
                </Text>
              </View>
              <Text
                className={classnames(
                  user.emailPublic ? styles.contactValue : styles.contactValueHidden
                )}
              >
                {maskContact(user.email, user.emailPublic)}
              </Text>
            </View>
          </View>

          <View className={styles.contactItem}>
            <View className={styles.contactIcon}>📱</View>
            <View className={styles.contactInfo}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text className={styles.contactLabel}>电话</Text>
                <Text className={classnames(styles.badge, user.phonePublic ? styles.badgePublic : styles.badgePrivate)}>
                  {user.phonePublic ? '公开' : '隐藏'}
                </Text>
              </View>
              <Text
                className={classnames(
                  user.phonePublic ? styles.contactValue : styles.contactValueHidden
                )}
              >
                {maskContact(user.phone, user.phonePublic)}
              </Text>
            </View>
          </View>

          <View className={styles.contactItem}>
            <View className={styles.contactIcon}>💬</View>
            <View className={styles.contactInfo}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text className={styles.contactLabel}>微信</Text>
                <Text className={classnames(styles.badge, user.wechatPublic ? styles.badgePublic : styles.badgePrivate)}>
                  {user.wechatPublic ? '公开' : '隐藏'}
                </Text>
              </View>
              <Text
                className={classnames(
                  user.wechatPublic ? styles.contactValue : styles.contactValueHidden
                )}
              >
                {maskContact(user.wechat, user.wechatPublic)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MessageDetailPage;
