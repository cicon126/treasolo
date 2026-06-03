import React from 'react';
import { View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

interface AvatarProps {
  src: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ src, size = 'medium', onClick }) => {
  const sizeClass = {
    small: styles.avatarSmall,
    medium: styles.avatarMedium,
    large: styles.avatarLarge
  };

  const handleImageError = (e) => {
    console.error('[Avatar] Image load error:', e.detail);
  };

  return (
    <View
      className={classnames(
        styles.avatar,
        sizeClass[size],
        onClick && styles.avatarClickable
      )}
      onClick={onClick}
    >
      <Image
        className={styles.avatarImage}
        src={src}
        mode="aspectFill"
        onError={handleImageError}
      />
    </View>
  );
};

export default Avatar;
