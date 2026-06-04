import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface HealthCardProps {
  icon: string;
  label: string;
  value?: string | number;
  unit?: string;
  status?: { label: string; color: string };
  bgColor?: string;
  onClick?: () => void;
}

const HealthCard: React.FC<HealthCardProps> = ({ icon, label, value, unit, status, bgColor, onClick }) => {
  return (
    <View className={classnames(styles.card, onClick && styles.clickable)} style={{ backgroundColor: bgColor || '#fff' }} onClick={onClick}>
      <View className={styles.header}>
        <Text className={styles.icon}>{icon}</Text>
        <Text className={styles.label}>{label}</Text>
      </View>
      <View className={styles.body}>
        {value !== undefined ? (
          <View className={styles.valueRow}>
            <Text className={styles.value}>{value}</Text>
            {unit && <Text className={styles.unit}>{unit}</Text>}
          </View>
        ) : (
          <Text className={styles.noData}>未录入</Text>
        )}
      </View>
      {status && (
        <View className={styles.status} style={{ backgroundColor: status.color + '1A', color: status.color }}>
          <Text className={styles.statusText}>{status.label}</Text>
        </View>
      )}
    </View>
  );
};

export default HealthCard;
