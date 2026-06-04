import React from 'react';
import { View, Text, Input } from '@tarojs/components';
import styles from './index.module.scss';

interface MetricInputProps {
  label: string;
  value: string;
  placeholder?: string;
  unit?: string;
  type?: 'digit' | 'number';
  onInput: (value: string) => void;
}

const MetricInput: React.FC<MetricInputProps> = ({ label, value, placeholder, unit, type = 'digit', onInput }) => {
  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.label}>{label}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      <View className={styles.inputWrap}>
        <Input
          className={styles.input}
          type={type}
          value={value}
          placeholder={placeholder || '请输入'}
          onInput={(e) => onInput(e.detail.value)}
        />
      </View>
    </View>
  );
};

export default MetricInput;
