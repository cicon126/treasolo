import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { Customer, CUSTOMER_LEVELS, CUSTOMER_SOURCES } from '../../types';
import { formatDate, isOverdue, isToday, isUpcoming } from '../../utils/storage';
import styles from './index.module.scss';

interface CustomerCardProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onAddFollowup?: (customer: Customer) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onEdit, onDelete, onAddFollowup }) => {
  const levelInfo = CUSTOMER_LEVELS.find((l) => l.value === customer.level);
  const sourceInfo = CUSTOMER_SOURCES.find((s) => s.value === customer.source);

  const getReminderStatus = () => {
    if (!customer.nextFollowupAt) return null;
    if (isToday(customer.nextFollowupAt)) {
      return { text: '今日待跟进', type: 'today' };
    }
    if (isOverdue(customer.nextFollowupAt)) {
      return { text: '已逾期', type: 'overdue' };
    }
    if (isUpcoming(customer.nextFollowupAt, 3)) {
      return { text: '即将跟进', type: 'upcoming' };
    }
    return null;
  };

  const reminder = getReminderStatus();

  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/pages/customer-detail/index?id=${customer.id}`,
    });
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (customer.phone) {
      Taro.makePhoneCall({
        phoneNumber: customer.phone,
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleCardClick}>
      <View className={styles.cardHeader}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>{customer.name.charAt(0)}</Text>
        </View>
        <View className={styles.basicInfo}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{customer.name}</Text>
            {levelInfo && (
              <View
                className={classnames(styles.levelTag, styles[`level${customer.level.charAt(0).toUpperCase() + customer.level.slice(1)}`])}
              >
                <Text className={styles.levelText}>{levelInfo.label}</Text>
              </View>
            )}
            {reminder && (
              <View className={classnames(styles.reminderTag, styles[`reminder${reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}`])}>
                <Text className={styles.reminderText}>{reminder.text}</Text>
              </View>
            )}
          </View>
          <Text className={styles.position}>
            {customer.position} · {customer.company}
          </Text>
        </View>
      </View>

      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>来源：</Text>
          <Text className={styles.infoValue}>{sourceInfo?.label || customer.source}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>上次跟进：</Text>
          <Text className={styles.infoValue}>
            {customer.lastFollowupAt ? formatDate(customer.lastFollowupAt, 'MM-DD HH:mm') : '暂无'}
          </Text>
        </View>
        {customer.nextFollowupAt && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>下次跟进：</Text>
            <Text
              className={classnames(
                styles.infoValue,
                reminder?.type === 'overdue' && styles.textOverdue,
                reminder?.type === 'today' && styles.textToday
              )}
            >
              {formatDate(customer.nextFollowupAt, 'YYYY-MM-DD')}
            </Text>
          </View>
        )}
      </View>

      <View className={styles.cardFooter}>
        <Button
          className={classnames(styles.actionBtn, styles.callBtn)}
          onClick={handleCall}
        >
          <Text className={styles.btnText}>📞 电话</Text>
        </Button>
        {onAddFollowup && (
          <Button
            className={classnames(styles.actionBtn, styles.followupBtn)}
            onClick={(e) => {
              e.stopPropagation();
              onAddFollowup(customer);
            }}
          >
            <Text className={styles.btnText}>✏️ 跟进</Text>
          </Button>
        )}
        {onEdit && (
          <Button
            className={classnames(styles.actionBtn, styles.editBtn)}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(customer);
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
              onDelete(customer);
            }}
          >
            <Text className={styles.btnText}>删除</Text>
          </Button>
        )}
      </View>
    </View>
  );
};

export default CustomerCard;
