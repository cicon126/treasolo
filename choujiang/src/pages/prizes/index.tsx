import React, { useState } from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePrizeContext } from '@/store/PrizeContext';
import { Prize } from '@/types/prize';
import styles from './index.module.scss';
import classnames from 'classnames';

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#95E1D3',
  '#F38181',
  '#AA96DA',
  '#FCBAD3',
  '#A8D8EA',
  '#88D8B0',
  '#FFAAA5',
  '#FF8B94',
  '#B5EAEA'
];

const PrizesPage: React.FC = () => {
  const { prizes, addPrize, updatePrize, deletePrize } = usePrizeContext();
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    probability: 10,
    color: COLORS[0],
    image: ''
  });

  const handleAdd = () => {
    setEditingPrize(null);
    setFormData({
      name: '',
      probability: 10,
      color: COLORS[0],
      image: ''
    });
    setShowModal(true);
  };

  const handleEdit = (prize: Prize) => {
    setEditingPrize(prize);
    setFormData({
      name: prize.name,
      probability: prize.probability,
      color: prize.color,
      image: prize.image
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个奖品吗？',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          deletePrize(id);
          Taro.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setFormData({ ...formData, image: tempFilePath });
        console.log('[PrizesPage] 选择图片成功', tempFilePath);
      },
      fail: (err) => {
        console.error('[PrizesPage] 选择图片失败', err);
        Taro.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  };

  const handleConfirm = () => {
    if (!formData.name.trim()) {
      Taro.showToast({ title: '请输入奖品名称', icon: 'none' });
      return;
    }

    if (formData.probability <= 0 || formData.probability > 100) {
      Taro.showToast({ title: '概率请设置1-100', icon: 'none' });
      return;
    }

    if (editingPrize) {
      updatePrize(editingPrize.id, formData);
      Taro.showToast({ title: '修改成功', icon: 'success' });
    } else {
      addPrize(formData);
      Taro.showToast({ title: '添加成功', icon: 'success' });
    }

    setShowModal(false);
  };

  const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);

  return (
    <View className={styles.container}>
      <View className={styles.addButton} onClick={handleAdd}>
        <Text className={styles.addButtonText}>+ 添加奖品</Text>
      </View>

      {prizes.length > 0 ? (
        <>
          <View className={styles.prizeList}>
            {prizes.map((prize) => (
              <View key={prize.id} className={styles.prizeCard}>
                {prize.image ? (
                  <Image
                    className={styles.prizeImage}
                    src={prize.image}
                    mode="aspectFill"
                  />
                ) : (
                  <View
                    className={styles.colorIndicator}
                    style={{ backgroundColor: prize.color }}
                  />
                )}
                <View className={styles.prizeInfo}>
                  <Text className={styles.prizeName}>{prize.name}</Text>
                  <Text className={styles.prizeProbability}>
                    权重: {prize.probability}
                  </Text>
                </View>
                <View className={styles.actions}>
                  <View
                    className={classnames(styles.actionButton, styles.editButton)}
                    onClick={() => handleEdit(prize)}
                  >
                    <Text>✏️</Text>
                  </View>
                  <View
                    className={classnames(styles.actionButton, styles.deleteButton)}
                    onClick={() => handleDelete(prize.id)}
                  >
                    <Text>🗑️</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <Text className={styles.tip}>总权重: {totalProbability}</Text>
        </>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🎁</Text>
          <Text className={styles.emptyText}>暂无奖品，点击上方按钮添加</Text>
        </View>
      )}

      {showModal && (
        <View className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {editingPrize ? '编辑奖品' : '添加奖品'}
            </Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>奖品图片</Text>
              <View className={styles.imagePicker} onClick={handleChooseImage}>
                {formData.image ? (
                  <Image
                    className={styles.imagePreview}
                    src={formData.image}
                    mode="aspectFill"
                  />
                ) : (
                  <View className={styles.imagePlaceholder}>
                    <Text className={styles.imagePlaceholderIcon}>📷</Text>
                    <Text className={styles.imagePlaceholderText}>点击上传图片</Text>
                  </View>
                )}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>奖品名称</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入奖品名称"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>中奖权重 (1-100)</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="请输入权重"
                value={String(formData.probability)}
                onInput={(e) => setFormData({ ...formData, probability: Number(e.detail.value) || 0 })}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>扇区颜色</Text>
              <View className={styles.colorPicker}>
                {COLORS.map((color) => (
                  <View
                    key={color}
                    className={classnames(styles.colorOption, {
                      [styles.selected]: formData.color === color
                    })}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </View>
            </View>

            <View className={styles.modalActions}>
              <View
                className={classnames(styles.modalButton, styles.cancelButton)}
                onClick={() => setShowModal(false)}
              >
                <Text className={styles.cancelButtonText}>取消</Text>
              </View>
              <View
                className={classnames(styles.modalButton, styles.confirmButton)}
                onClick={handleConfirm}
              >
                <Text className={styles.confirmButtonText}>确定</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PrizesPage;
