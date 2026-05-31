import React, { useState, useCallback } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePrizeContext } from '@/store/PrizeContext';
import { Prize } from '@/types/prize';
import Wheel from '@/components/Wheel';
import styles from './index.module.scss';

const IndexPage: React.FC = () => {
  const { prizes, addRecord } = usePrizeContext();
  const [lastPrize, setLastPrize] = useState<Prize | null>(null);

  const handleSpinEnd = useCallback((prize: Prize) => {
    setLastPrize(prize);

    const record = {
      id: Date.now().toString(),
      prizeId: prize.id,
      prizeName: prize.name,
      prizeImage: prize.image,
      timestamp: Date.now()
    };
    addRecord(record);

    Taro.showModal({
      title: '🎉 恭喜中奖',
      content: `您获得了：${prize.name}`,
      showCancel: false,
      confirmText: '太棒了',
      confirmColor: '#FF6B6B'
    });
  }, [addRecord]);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>🎡 幸运大转盘</Text>
        <Text className={styles.subtitle}>点击中心按钮开始抽奖</Text>
      </View>

      {prizes.length > 0 ? (
        <>
          <View className={styles.wheelWrapper}>
            <Wheel
              prizes={prizes}
              onSpinEnd={handleSpinEnd}
            />
          </View>

          {lastPrize && (
            <View className={styles.resultCard}>
              <Text className={styles.resultTitle}>最近中奖</Text>
              {lastPrize.image && (
                <Image
                  className={styles.resultImage}
                  src={lastPrize.image}
                  mode="aspectFill"
                />
              )}
              <Text className={styles.resultContent}>{lastPrize.name}</Text>
            </View>
          )}

          <Text className={styles.tip}>奖品数量: {prizes.length} 个</Text>
        </>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>暂无奖品，请先在「奖品」页面添加奖品</Text>
        </View>
      )}
    </View>
  );
};

export default IndexPage;
