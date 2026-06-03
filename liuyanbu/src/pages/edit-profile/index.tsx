import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Avatar from '@/components/Avatar';
import { User } from '@/types';
import { getCurrentUser, updateCurrentUser } from '@/store/userStore';
import classnames from 'classnames';

const avatarOptions = [
  'https://picsum.photos/id/64/200/200',
  'https://picsum.photos/id/91/200/200',
  'https://picsum.photos/id/177/200/200',
  'https://picsum.photos/id/338/200/200',
  'https://picsum.photos/id/1027/200/200',
  'https://picsum.photos/id/1005/200/200',
  'https://picsum.photos/id/1012/200/200',
  'https://picsum.photos/id/1025/200/200'
];

const EditProfilePage: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setNickname(user.nickname);
    setBio(user.bio);
    setSelectedAvatar(user.avatar);
    console.log('[EditProfile] Loaded current user:', user.nickname);
  }, []);

  const handleAvatarClick = () => {
    setShowAvatarOptions(!showAvatarOptions);
  };

  const selectAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
    setShowAvatarOptions(false);
  };

  const handleSave = () => {
    if (!nickname.trim()) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    try {
      updateCurrentUser({
        nickname: nickname.trim(),
        bio: bio.trim(),
        avatar: selectedAvatar
      });

      console.log('[EditProfile] Profile updated successfully');
      
      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      });

      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } catch (error) {
      console.error('[EditProfile] Save error:', error);
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.avatarSection}>
        <Text className={styles.avatarLabel}>点击头像更换</Text>
        <View className={styles.avatarWrapper} onClick={handleAvatarClick}>
          <Avatar src={selectedAvatar} size="large" />
          <View className={styles.changeIcon}>✎</View>
        </View>

        {showAvatarOptions && (
          <View className={styles.avatarOptions}>
            <Text className={styles.optionsTitle}>选择头像</Text>
            <View className={styles.optionsGrid}>
              {avatarOptions.map((avatar, index) => (
                <View
                  key={index}
                  className={classnames(
                    styles.optionItem,
                    selectedAvatar === avatar && styles.selected
                  )}
                  onClick={() => selectAvatar(avatar)}
                >
                  <Image
                    className={styles.optionImage}
                    src={avatar}
                    mode="aspectFill"
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className={styles.form}>
        <View className={styles.formItem}>
          <Text className={styles.label}>昵称</Text>
          <Input
            className={styles.input}
            placeholder="请输入昵称"
            value={nickname}
            onInput={(e) => setNickname(e.detail.value)}
            maxlength={20}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>个人简介</Text>
          <Textarea
            className={styles.textarea}
            placeholder="介绍一下自己吧..."
            value={bio}
            onInput={(e) => setBio(e.detail.value)}
            maxlength={100}
            autoHeight
            showConfirmBar={false}
          />
        </View>
      </View>

      <Button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={!nickname.trim()}
      >
        保存修改
      </Button>
    </View>
  );
};

export default EditProfilePage;
