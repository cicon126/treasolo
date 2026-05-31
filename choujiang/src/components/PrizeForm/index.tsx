import React, { useState, useEffect } from 'react';
import { View, Text, Input, Button, Image, Slider } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { Prize } from '@/types/prize';
import styles from './index.module.scss';

interface PrizeFormProps {
  visible: boolean;
  prize?: Prize | null;
  onConfirm: (data: { name: string; image: string; probability: number }) => void;
  onCancel: () => void;
}

const PrizeForm: React.FC<PrizeFormProps> = ({ visible, prize, onConfirm, onCancel }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [probability, setProbability] = useState(10);

  useEffect(() => {
    if (visible) {
      if (prize) {
        setName(prize.name);
        setImage(prize.image);
        setProbability(prize.probability);
      } else {
        setName('');
        setImage('');
        setProbability(10);
      }
    }
  }, [visible, prize]);

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setImage(res.tempFilePaths[0]);
      }
    } catch (error) {
      console.error('[PrizeForm] chooseImage error:', error);
    }
  };

  const handleConfirm = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入奖品名称', icon: 'none' });
      return;
    }
    if (!image) {
      Taro.showToast({ title: '请上传奖品图片', icon: 'none' });
      return;
    }
    onConfirm({ name: name.trim(), image, probability });
  };

  if (!visible) return null;

  return (
    <View className={styles.overlay} onClick={onCancel}>
      <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <Text className={styles.modalTitle}>{prize ? '编辑奖品' : '添加奖品'}</Text>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>奖品名称</Text>
          <Input
            className={styles.formInput}
            placeholder='请输入奖品名称'
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxLength={20}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>奖品图片</Text>
          {image ? (
            <Image
              className={styles.uploadedImage}
              src={image}
              mode='aspectFill'
              onClick={handleChooseImage}
            />
          ) : (
            <View className={styles.imageUpload} onClick={handleChooseImage}>
              <Text className={styles.plusIcon}>+</Text>
              <Text className={styles.uploadText}>点击上传图片</Text>
            </View>
          )}
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>中奖概率：{probability}%</Text>
          <Slider
            className={styles.probabilitySlider}
            min={1}
            max={100}
            value={probability}
            onChange={(e) => setProbability(e.detail.value)}
            activeColor='#ff6b6b'
            backgroundColor='#e5e6eb'
            blockSize={24}
          />
        </View>

        <View className={styles.buttonGroup}>
          <Button
            className={classNames(styles.modalButton, styles.cancelButton)}
            onClick={onCancel}
          >
            取消
          </Button>
          <Button
            className={classNames(styles.modalButton, styles.confirmButton)}
            onClick={handleConfirm}
          >
            确定
          </Button>
        </View>
      </View>
    </View>
  );
};

export default PrizeForm;
