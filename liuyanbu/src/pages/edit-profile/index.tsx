import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, Button, Input, Textarea, Switch } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useStore } from '@/store/useStore';
import { User } from '@/types';

const avatarOptions = [
  'https://picsum.photos/id/1005/200/200',
  'https://picsum.photos/id/1012/200/200',
  'https://picsum.photos/id/1025/200/200',
  'https://picsum.photos/id/1027/200/200',
  'https://picsum.photos/id/1062/200/200',
  'https://picsum.photos/id/1074/200/200',
  'https://picsum.photos/id/169/200/200',
  'https://picsum.photos/id/338/200/200',
  'https://picsum.photos/id/64/200/200',
  'https://picsum.photos/id/91/200/200'
];

const EditProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUser } = useStore();
  const [formData, setFormData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({ ...currentUser });
      console.log('[EditProfilePage] init form data', currentUser);
    }
  }, [currentUser]);

  useDidShow(() => {
    console.log('[EditProfilePage] page show');
  });

  const handleAvatarClick = useCallback(() => {
    console.log('[EditProfilePage] avatar click');
    Taro.showActionSheet({
      itemList: ['更换头像']
    }).then((res) => {
      if (res.tapIndex === 0) {
        const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
        setFormData(prev => ({ ...prev, avatar: randomAvatar }));
        Taro.showToast({
          title: '头像已更新',
          icon: 'success'
        });
        console.log('[EditProfilePage] avatar updated:', randomAvatar);
      }
    }).catch((err) => {
      console.error('[EditProfilePage] showActionSheet error', err);
    });
  }, []);

  const handleInputChange = useCallback((field: keyof User, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleContactEdit = useCallback((field: 'email' | 'phone' | 'wechat', label: string) => {
    console.log('[EditProfilePage] edit contact:', field);
    
    const currentValue = formData[field] || '';
    
    Taro.showModal({
      title: `修改${label}`,
      editable: true,
      placeholderText: `请输入${label}`,
      content: currentValue as string,
      success: (res) => {
        if (res.confirm && res.content !== undefined) {
          setFormData(prev => ({ ...prev, [field]: res.content!.trim() }));
          console.log('[EditProfilePage] contact updated:', field, res.content);
        }
      }
    }).catch((err) => {
      console.error('[EditProfilePage] showModal error', err);
    });
  }, [formData]);

  const handleSave = useCallback(() => {
    if (!currentUser) return;

    const { nickname } = formData;
    if (!nickname || !nickname.trim()) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    setSaving(true);

    try {
      updateCurrentUser(formData as Partial<User>);
      console.log('[EditProfilePage] profile saved:', formData);

      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      });

      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } catch (err) {
      console.error('[EditProfilePage] save error', err);
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      });
    } finally {
      setSaving(false);
    }
  }, [currentUser, formData, updateCurrentUser]);

  if (!currentUser) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.avatarSection}>
        <View className={styles.avatarWrapper} onClick={handleAvatarClick}>
          <Image
            className={styles.avatar}
            src={formData.avatar || currentUser.avatar}
            mode='aspectFill'
            onError={(e) => {
              console.error('[EditProfilePage] avatar load error', e);
            }}
          />
          <View className={styles.avatarEditIcon}>📷</View>
        </View>
        <Text className={styles.avatarTip}>点击更换头像</Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.formGroupTitle}>基本信息</Text>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>昵称</Text>
            <Input
              className={styles.formInput}
              placeholder='请输入昵称'
              value={formData.nickname || ''}
              onInput={(e) => handleInputChange('nickname', e.detail.value)}
              maxlength={20}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>简介</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder='介绍一下自己吧'
              value={formData.bio || ''}
              onInput={(e) => handleInputChange('bio', e.detail.value)}
              maxlength={100}
              autoHeight
            />
          </View>
        </View>

        <Text className={styles.formGroupTitle}>联系方式（点击可修改）</Text>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>📧 邮箱</Text>
            <View className={styles.formRow} onClick={() => handleContactEdit('email', '邮箱')}>
              <Text className={classnames(styles.formValue, !formData.email && styles.formValue)}>
                {formData.email || '未设置'}
              </Text>
            </View>
            <Switch
              className={styles.privacySwitch}
              checked={formData.emailPublic || false}
              onChange={(e) => handleInputChange('emailPublic', e.detail.value)}
              color='#6366f1'
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>📱 电话</Text>
            <View className={styles.formRow} onClick={() => handleContactEdit('phone', '电话')}>
              <Text className={classnames(styles.formValue, !formData.phone && styles.formValue)}>
                {formData.phone || '未设置'}
              </Text>
            </View>
            <Switch
              className={styles.privacySwitch}
              checked={formData.phonePublic || false}
              onChange={(e) => handleInputChange('phonePublic', e.detail.value)}
              color='#6366f1'
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>💬 微信</Text>
            <View className={styles.formRow} onClick={() => handleContactEdit('wechat', '微信')}>
              <Text className={classnames(styles.formValue, !formData.wechat && styles.formValue)}>
                {formData.wechat || '未设置'}
              </Text>
            </View>
            <Switch
              className={styles.privacySwitch}
              checked={formData.wechatPublic || false}
              onChange={(e) => handleInputChange('wechatPublic', e.detail.value)}
              color='#6366f1'
            />
          </View>
        </View>

        <Text className={styles.formGroupTitle}>
          开关开启后，联系方式将对所有用户公开
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存'}
        </Button>
      </View>
    </View>
  );
};

export default EditProfilePage;
