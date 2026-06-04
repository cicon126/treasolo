import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface AdviceCardProps {
  title: string;
  description: string;
  suggestions: string[];
  level: 'normal' | 'warning' | 'danger';
}

const levelConfig = {
  normal: { icon: '✅', borderColor: '#2DB67D', bgColor: '#E8F8F0' },
  warning: { icon: '⚠️', borderColor: '#FF7D00', bgColor: '#FFF7E6' },
  danger: { icon: '🚨', borderColor: '#F53F3F', bgColor: '#FFF0F0' }
};

const AdviceCard: React.FC<AdviceCardProps> = ({ title, description, suggestions, level }) => {
  const config = levelConfig[level];

  return (
    <View className={styles.card} style={{ borderLeftColor: config.borderColor, backgroundColor: config.bgColor }}>
      <View className={styles.header}>
        <Text className={styles.icon}>{config.icon}</Text>
        <Text className={styles.title} style={{ color: config.borderColor }}>{title}</Text>
      </View>
      <Text className={styles.desc}>{description}</Text>
      <View className={styles.suggestions}>
        {suggestions.map((s, i) => (
          <View key={i} className={styles.suggestionItem}>
            <Text className={styles.bullet}>•</Text>
            <Text className={styles.suggestionText}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AdviceCard;
