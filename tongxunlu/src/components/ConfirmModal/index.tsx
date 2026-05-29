import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  content,
  confirmText = '确认',
  cancelText = '取消',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <View className={styles.modalOverlay} onClick={onCancel}>
      <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.content}>{content}</Text>
        <View className={styles.actions}>
          <Button className={classnames(styles.btn, styles.cancelBtn)} onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            className={classnames(styles.btn, styles.confirmBtn, styles[`confirm${confirmColor.charAt(0).toUpperCase() + confirmColor.slice(1)}`])}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ConfirmModal;
