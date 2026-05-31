import React from 'react';
import { View, Image, Text, Button } from '@tarojs/components';
import classNames from 'classnames';
import { Prize } from '@/types/prize';
import styles from './index.module.scss';

interface PrizeCardProps {
  prize: Prize;
  onEdit?: (prize: Prize) => void;
  onDelete?: (id: string) => void;
}

const PrizeCard: React.FC<PrizeCardProps> = ({ prize, onEdit, onDelete }) => {
  return (
    <View className={styles.card}>
      <View className={styles.cardContent}>
        <Image
          className={styles.prizeImage}
          src={prize.image}
          mode='aspectFill'
        />
        <View className={styles.prizeInfo}>
          <Text className={styles.prizeName}>{prize.name}</Text>
          <View className={styles.probabilityRow}>
            <Text className={styles.probabilityLabel}>中奖概率：</Text>
            <Text className={styles.probabilityValue}>{prize.probability}%</Text>
          </View>
        </View>
      </View>
      <View className={styles.cardActions}>
        <Button
          className={classNames(styles.actionButton, styles.editButton)}
          onClick={() => onEdit?.(prize)}
        >
          编辑
        </Button>
        <Button
          className={classNames(styles.actionButton, styles.deleteButton)}
          onClick={() => onDelete?.(prize.id)}
        >
          删除
        </Button>
      </View>
    </View>
  );
};

export default PrizeCard;
