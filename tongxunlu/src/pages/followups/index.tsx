import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Followup, FOLLOWUP_TYPES } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS } from '../../utils/storage';
import { mockFollowups } from '../../data/mock';
import FollowupCard from '../../components/FollowupCard';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import styles from './index.module.scss';
import classnames from 'classnames';

const FollowupsPage: React.FC = () => {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [activeType, setActiveType] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; followup: Followup | null }>({
    visible: false,
    followup: null,
  });

  const loadData = useCallback(() => {
    console.log('[Followups] Loading data...');
    let storedFollowups = getStorage<Followup[]>(STORAGE_KEYS.FOLLOWUPS, []);

    if (storedFollowups.length === 0) {
      console.log('[Followups] No followups found, loading mock data');
      storedFollowups = mockFollowups;
      setStorage(STORAGE_KEYS.FOLLOWUPS, storedFollowups);
    }

    setFollowups(storedFollowups);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    loadData();
  });

  const handleRefresh = () => {
    loadData();
    Taro.stopPullDownRefresh();
  };

  const filteredFollowups = useMemo(() => {
    let result = [...followups];

    if (activeType !== 'all') {
      result = result.filter((f) => f.type === activeType);
    }

    return result.sort((a, b) => new Date(b.followupAt).getTime() - new Date(a.followupAt).getTime());
  }, [followups, activeType]);

  const groupedFollowups = useMemo(() => {
    const groups: Record<string, Followup[]> = {};

    filteredFollowups.forEach((f) => {
      const date = f.followupAt.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(f);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }));
  }, [filteredFollowups]);

  const handleAddFollowup = () => {
    Taro.navigateTo({ url: '/pages/followup-edit/index' });
  };

  const handleEditFollowup = (followup: Followup) => {
    Taro.navigateTo({
      url: `/pages/followup-edit/index?id=${followup.id}&customerId=${followup.customerId}&customerName=${encodeURIComponent(followup.customerName)}`,
    });
  };

  const handleDeleteClick = (followup: Followup) => {
    setDeleteModal({ visible: true, followup });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.followup) return;

    const updatedFollowups = followups.filter((f) => f.id !== deleteModal.followup!.id);
    setStorage(STORAGE_KEYS.FOLLOWUPS, updatedFollowups);
    setFollowups(updatedFollowups);
    setDeleteModal({ visible: false, followup: null });
    Taro.showToast({ title: '删除成功', icon: 'success' });
  };

  const formatGroupDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateStr === today) return '今天';
    if (dateStr === yesterday) return '昨天';
    
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}月${day}日`;
  };

  return (
    <View className={styles.page}>
      <View className={styles.filterSection}>
        <View className={styles.filterRow}>
          <View
            className={classnames(styles.filterTag, activeType === 'all' && styles.active)}
            onClick={() => setActiveType('all')}
          >
            全部类型
          </View>
          {FOLLOWUP_TYPES.map((type) => (
            <View
              key={type.value}
              className={classnames(styles.filterTag, activeType === type.value && styles.active)}
              onClick={() => setActiveType(type.value)}
            >
              {type.label}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        scrollY
        onScrollToUpper={handleRefresh}
        className={styles.followupList}
      >
        {filteredFollowups.length > 0 ? (
          groupedFollowups.map((group) => (
            <View key={group.date}>
              <Text className={styles.sectionTitle}>
                📅 {formatGroupDate(group.date)} ({group.items.length}条)
              </Text>
              {group.items.map((followup) => (
                <FollowupCard
                  key={followup.id}
                  followup={followup}
                  onEdit={handleEditFollowup}
                  onDelete={handleDeleteClick}
                />
              ))}
            </View>
          ))
        ) : (
          <EmptyState
            title="暂无跟进记录"
            description={activeType !== 'all' ? '没有找到匹配的跟进记录' : '点击下方按钮添加第一条跟进记录'}
            actionText={activeType !== 'all' ? '清除筛选' : '新增跟进'}
            onAction={() => {
              if (activeType !== 'all') {
                setActiveType('all');
              } else {
                handleAddFollowup();
              }
            }}
          />
        )}
      </ScrollView>

      <Button className={styles.fab} onClick={handleAddFollowup}>
        <Text className={styles.fabText}>+</Text>
      </Button>

      <ConfirmModal
        visible={deleteModal.visible}
        title="确认删除"
        content={`确定要删除这条跟进记录吗？删除后无法恢复。`}
        confirmText="删除"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ visible: false, followup: null })}
      />
    </View>
  );
};

export default FollowupsPage;
