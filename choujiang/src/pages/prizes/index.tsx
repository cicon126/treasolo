import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import PrizeCard from '@/components/PrizeCard';
import PrizeForm from '@/components/PrizeForm';
import { usePrizeContext } from '@/store/prizeContext';
import { Prize } from '@/types/prize';
import styles from './index.module.scss';

const PrizesPage: React.FC = () => {
  const { prizes, addPrize, updatePrize, deletePrize, loading } = usePrizeContext();
  const [formVisible, setFormVisible] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  const handleAdd = () => {
    setEditingPrize(null);
    setFormVisible(true);
  };

  const handleEdit = (prize: Prize) => {
    setEditingPrize(prize);
    setFormVisible(true);
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个奖品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deletePrize(id);
            Taro.showToast({ title: '删除成功', icon: 'success' });
          } catch (error) {
            console.error('[PrizesPage] delete error:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const handleConfirm = async (data: { name: string; image: string; probability: number }) => {
    try {
      if (editingPrize) {
        await updatePrize(editingPrize.id, data);
        Taro.showToast({ title: '更新成功', icon: 'success' });
      } else {
        await addPrize(data);
        Taro.showToast({ title: '添加成功', icon: 'success' });
      }
      setFormVisible(false);
      setEditingPrize(null);
    } catch (error) {
      console.error('[PrizesPage] confirm error:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleCancel = () => {
    setFormVisible(false);
    setEditingPrize(null);
  };

  const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
  const isProbabilityValid = totalProbability === 100;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>奖品列表</Text>
        <Button className={styles.addButton} onClick={handleAdd}>
          + 添加奖品
        </Button>
      </View>

      {loading ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>加载中...</Text>
        </View>
      ) : prizes.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🎁</Text>
          <Text className={styles.emptyText}>暂无奖品，点击上方按钮添加</Text>
        </View>
      ) : (
        <ScrollView className={styles.list} scrollY>
          {prizes.map((prize) => (
            <PrizeCard
              key={prize.id}
              prize={prize}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}

      <View className={styles.totalProbability}>
        <Text className={styles.totalLabel}>总概率：</Text>
        <Text
          className={classNames(
            styles.totalValue,
            !isProbabilityValid && styles.totalWarning
          )}
        >
          {totalProbability}%
        </Text>
        {!isProbabilityValid && (
          <Text className={styles.totalLabel}>（建议设置为100%）</Text>
        )}
      </View>

      <PrizeForm
        visible={formVisible}
        prize={editingPrize}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default PrizesPage;
