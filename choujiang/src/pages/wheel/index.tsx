import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Wheel from '@/components/Wheel';
import { usePrizeContext } from '@/store/prizeContext';
import styles from './index.module.scss';

const WheelPage: React.FC = () => {
  const { prizes, addHistoryItem, loading } = usePrizeContext();
  const [lastPrize, setLastPrize] = useState<string | null>(null);

  const handleSpinEnd = async (prize) => {
    setLastPrize(prize.name);
    try {
      await addHistoryItem({
        prizeId: prize.id,
        prizeName: prize.name,
        prizeImage: prize.image
      });
      Taro.showModal({
        title: '恭喜中奖！',
        content: `您获得了：${prize.name}`,
        showCancel: false,
        confirmText: '太棒了'
      });
    } catch (error) {
      console.error('[WheelPage] addHistory error:', error);
    }
  };

  const goToPrizes = () => {
    Taro.switchTab({ url: '/pages/prizes/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>🎡 幸运大转盘</Text>
        <Text className={styles.subtitle}>点击中心按钮开始抽奖</Text>
      </View>

      {loading ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>加载中...</Text>
        </View>
      ) : prizes.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>暂无奖品，请先添加奖品</Text>
          <Button className={styles.emptyButton} onClick={goToPrizes}>
            去添加奖品
          </Button>
        </View>
      ) : (
        <>
          <View className={styles.wheelWrapper}>
            <Wheel prizes={prizes} onSpinEnd={handleSpinEnd} />
          </View>

          {lastPrize && (
            <View className={styles.resultCard}>
              <Text className={styles.resultTitle}>上一次中奖</Text>
              <Text className={styles.resultPrize}>{lastPrize}</Text>
            </View>
          )}

          <Text className={styles.tip}>
            共 {prizes.length} 个奖品，点击中心「开始」按钮开始抽奖
          </Text>
        </>
      )}
    </View>
  );
};

export default WheelPage;
