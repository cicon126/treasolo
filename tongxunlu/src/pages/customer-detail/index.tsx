import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { Customer, Followup, CUSTOMER_LEVELS, CUSTOMER_SOURCES, FOLLOWUP_TYPES } from '../../types';
import { getStorage, STORAGE_KEYS, formatDate, isToday, isOverdue } from '../../utils/storage';
import ConfirmModal from '../../components/ConfirmModal';
import styles from './index.module.scss';
import classnames from 'classnames';

const CustomerDetailPage: React.FC = () => {
  const router = useRouter();
  const customerId = router.params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const loadData = useCallback(() => {
    if (!customerId) return;

    console.log('[CustomerDetail] Loading data for customer:', customerId);

    const customers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const allFollowups = getStorage<Followup[]>(STORAGE_KEYS.FOLLOWUPS, []);

    const found = customers.find((c) => c.id === customerId);
    if (!found) {
      Taro.showToast({ title: '客户不存在', icon: 'error' });
      setTimeout(() => Taro.navigateBack(), 1500);
      return;
    }

    setCustomer(found);

    const customerFollowups = allFollowups
      .filter((f) => f.customerId === customerId)
      .sort((a, b) => new Date(b.followupAt).getTime() - new Date(a.followupAt).getTime());
    setFollowups(customerFollowups);
  }, [customerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    loadData();
  });

  const levelInfo = useMemo(() => {
    if (!customer) return null;
    return CUSTOMER_LEVELS.find((l) => l.value === customer.level);
  }, [customer]);

  const sourceInfo = useMemo(() => {
    if (!customer) return null;
    return CUSTOMER_SOURCES.find((s) => s.value === customer.source);
  }, [customer]);

  const getFollowupTypeLabel = (type: string) => {
    const found = FOLLOWUP_TYPES.find((t) => t.value === type);
    return found?.label || type;
  };

  const handleCall = () => {
    if (customer?.phone) {
      Taro.makePhoneCall({
        phoneNumber: customer.phone,
      });
    }
  };

  const handleEdit = () => {
    Taro.navigateTo({ url: `/pages/customer-edit/index?id=${customerId}` });
  };

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!customer) return;

    const customers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const followups = getStorage<Followup[]>(STORAGE_KEYS.FOLLOWUPS, []);

    const updatedCustomers = customers.filter((c) => c.id !== customerId);
    const updatedFollowups = followups.filter((f) => f.customerId !== customerId);

    setStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    setStorage(STORAGE_KEYS.FOLLOWUPS, updatedFollowups);

    setDeleteModal(false);
    Taro.showToast({ title: '删除成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1500);
  };

  const handleAddFollowup = () => {
    Taro.navigateTo({
      url: `/pages/followup-edit/index?customerId=${customerId}&customerName=${encodeURIComponent(customer?.name || '')}`,
    });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  if (!customer) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const needsReminder = customer.nextFollowupAt && (isToday(customer.nextFollowupAt) || isOverdue(customer.nextFollowupAt));

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>{customer.name.charAt(0)}</Text>
        </View>
        <View className={styles.headerInfo}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{customer.name}</Text>
            {levelInfo && (
              <View className={styles.levelTag}>
                <Text className={styles.levelText}>{levelInfo.label}</Text>
              </View>
            )}
          </View>
          <Text className={styles.position}>{customer.position}</Text>
          <Text className={styles.company}>{customer.company}</Text>
        </View>
      </View>

      <View className={styles.content}>
        {needsReminder && (
          <View className={styles.reminderCard}>
            <Text className={styles.reminderText}>
              ⏰ {isOverdue(customer.nextFollowupAt!) && !isToday(customer.nextFollowupAt!)
                ? `跟进已逾期，上次计划：${formatDate(customer.nextFollowupAt!, 'YYYY-MM-DD')}`
                : `今日待跟进，计划时间：${formatDate(customer.nextFollowupAt!, 'YYYY-MM-DD')}`}
            </Text>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>基本信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>手机号</Text>
            <Text className={classnames(styles.infoValue, styles.phoneValue)}>{customer.phone}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>邮箱</Text>
            <Text className={styles.infoValue}>{customer.email || '-'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>客户来源</Text>
            <Text className={styles.infoValue}>{sourceInfo?.label || customer.source}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>地址</Text>
            <Text className={styles.infoValue}>{customer.address || '-'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>创建时间</Text>
            <Text className={styles.infoValue}>{formatDate(customer.createdAt, 'YYYY-MM-DD HH:mm')}</Text>
          </View>
        </View>

        {customer.remark && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>备注信息</Text>
            <Text className={styles.infoValue}>{customer.remark}</Text>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.followupHeader}>
            <Text className={styles.sectionTitle}>跟进记录</Text>
            <Text className={styles.followupCount}>共 {followups.length} 条</Text>
          </View>
          {followups.length > 0 ? (
            <View className={styles.followupList}>
              {followups.slice(0, 5).map((followup) => (
                <View key={followup.id} className={styles.followupItem}>
                  <View className={styles.followupItemHeader}>
                    <View className={styles.followupType}>
                      {getFollowupTypeLabel(followup.type)}
                    </View>
                    <Text className={styles.followupTime}>
                      {formatDate(followup.followupAt, 'MM-DD HH:mm')}
                    </Text>
                  </View>
                  <Text className={styles.followupContent}>{followup.content}</Text>
                  {followup.result && (
                    <Text className={styles.followupResult}>结果：{followup.result}</Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text className={styles.emptyFollowups}>暂无跟进记录</Text>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.btn, styles.btnSecondary)} onClick={handleBack}>
          返回
        </Button>
        <Button className={classnames(styles.btn, styles.btnSecondary)} onClick={handleEdit}>
          编辑
        </Button>
        <Button className={classnames(styles.btn, styles.btnCall)} onClick={handleCall}>
          📞 电话
        </Button>
        <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={handleAddFollowup}>
          ✏️ 跟进
        </Button>
      </View>

      <ConfirmModal
        visible={deleteModal}
        title="确认删除"
        content={`确定要删除客户"${customer.name}"吗？相关的跟进记录也会被删除。`}
        confirmText="删除"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </View>
  );
};

export default CustomerDetailPage;
