import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { Followup, FOLLOWUP_TYPES } from '../../types';
import { formatDate } from '../../utils/storage';
import styles from './index.module.scss';

interface FollowupCardProps {
  followup: Followup;
  onEdit?: (followup: Followup) => void;
  onDelete?: (followup: Followup) => void;
}

const FollowupCard: React.FC<FollowupCardProps> = ({ followup, onEdit, onDelete }) => {
  const typeInfo = FOLLOWUP_TYPES.find((t) => t.value === followup.type);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      call: '📞',
      visit: '🏢',
      meeting: '🤝',
      wechat: '💬',
      email: '📧',
      other: '📝',
    };
    return icons[type] || '📝';
  };

  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/pages/customer-detail/index?id=${followup.customerId}`,
    });
  };

  return (
    <View className={styles.card} onClick={handleCardClick}>
      <View className={styles.cardHeader}>
        <View className={styles.typeIcon}>
          <Text className={styles.iconText}>{getTypeIcon(followup.type)}</Text>
        </View>
        <View className={styles.headerInfo}>
          <View className={styles.headerRow}>
            <Text className={styles.customerName}>{followup.customerName}</Text>
            <View className={styles.typeTag}>
              <Text className={styles.typeText}>{typeInfo?.label || followup.type}</Text>
            </View>
          </View>
          <Text className={styles.followupTime}>
            {formatDate(followup.followupAt, 'YYYY-MM-DD HH:mm')}
          </Text>
        </View>
      </View>

      <View className={styles.cardBody}>
        <View className={styles.contentSection}>
          <Text className={styles.sectionLabel}>跟进内容</Text>
          <Text className={styles.contentText}>{followup.content}</Text>
        </View>
        {followup.result && (
          <View className={styles.contentSection}>
            <Text className={styles.sectionLabel}>跟进结果</Text>
            <Text className={styles.resultText}>{followup.result}</Text>
          </View>
        )}
        {followup.nextFollowupAt && (
          <View className={styles.nextFollowup}>
            <Text className={styles.nextLabel}>下次跟进：</Text>
            <Text className={styles.nextDate}>
              {formatDate(followup.nextFollowupAt, 'YYYY-MM-DD')}
            </Text>
          </View>
        )}
      </View>

      {(onEdit || onDelete) && (
        <View className={styles.cardFooter}>
          {onEdit && (
            <Button
              className={classnames(styles.actionBtn, styles.editBtn)}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(followup);
              }}
            >
              <Text className={styles.btnText}>编辑</Text>
            </Button>
          )}
          {onDelete && (
            <Button
              className={classnames(styles.actionBtn, styles.deleteBtn)}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(followup);
              }}
            >
              <Text className={styles.btnText}>删除</Text>
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

export default FollowupCard;
