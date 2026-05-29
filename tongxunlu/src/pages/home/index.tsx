import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Customer, Followup } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, isToday, formatDate, isOverdue } from '../../utils/storage';
import { mockCustomers, mockFollowups } from '../../data/mock';
import StatCard from '../../components/StatCard';
import FollowupCard from '../../components/FollowupCard';
import EmptyState from '../../components/EmptyState';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [todayFollowups, setTodayFollowups] = useState<Customer[]>([]);
  const [recentFollowups, setRecentFollowups] = useState<Followup[]>([]);

  const loadData = useCallback(() => {
    console.log('[Home] Loading data...');
    
    let storedCustomers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    let storedFollowups = getStorage<Followup[]>(STORAGE_KEYS.FOLLOWUPS, []);

    if (storedCustomers.length === 0) {
      console.log('[Home] No customers found, loading mock data');
      storedCustomers = mockCustomers;
      setStorage(STORAGE_KEYS.CUSTOMERS, storedCustomers);
    }

    if (storedFollowups.length === 0) {
      console.log('[Home] No followups found, loading mock data');
      storedFollowups = mockFollowups;
      setStorage(STORAGE_KEYS.FOLLOWUPS, storedFollowups);
    }

    setCustomers(storedCustomers);
    setFollowups(storedFollowups);

    const todayList = storedCustomers.filter((c) => c.nextFollowupAt && isToday(c.nextFollowupAt));
    const overdueList = storedCustomers.filter((c) => c.nextFollowupAt && isOverdue(c.nextFollowupAt) && !isToday(c.nextFollowupAt));
    setTodayFollowups([...overdueList, ...todayList]);

    const recent = [...storedFollowups]
      .sort((a, b) => new Date(b.followupAt).getTime() - new Date(a.followupAt).getTime())
      .slice(0, 5);
    setRecentFollowups(recent);
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
    Taro.showToast({ title: '刷新成功', icon: 'success' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const getNewCustomersThisMonth = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return customers.filter((c) => new Date(c.createdAt) >= monthStart).length;
  };

  const getPendingFollowups = () => {
    return customers.filter((c) => c.nextFollowupAt && (isToday(c.nextFollowupAt) || isOverdue(c.nextFollowupAt))).length;
  };

  const navigateToAddCustomer = () => {
    Taro.navigateTo({ url: '/pages/customer-edit/index' });
  };

  const navigateToAddFollowup = () => {
    Taro.navigateTo({ url: '/pages/followup-edit/index' });
  };

  const navigateToCustomers = () => {
    Taro.switchTab({ url: '/pages/customers/index' });
  };

  const navigateToFollowups = () => {
    Taro.switchTab({ url: '/pages/followups/index' });
  };

  const handleCustomerClick = (customerId: string) => {
    Taro.navigateTo({ url: `/pages/customer-detail/index?id=${customerId}` });
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
      onScrollToUpper={handleRefresh}
    >
      <View className={styles.header}>
        <Text className={styles.greeting}>{getGreeting()}！</Text>
        <Text className={styles.subtitle}>今天是 {formatDate(new Date(), 'YYYY年MM月DD日')}</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.statsRow}>
          <StatCard
            title="客户总数"
            value={customers.length}
            subtitle={`本月新增 ${getNewCustomersThisMonth()}`}
            color="primary"
            onClick={navigateToCustomers}
          />
          <StatCard
            title="跟进总数"
            value={followups.length}
            subtitle={`今日待跟进 ${todayFollowups.length}`}
            color="success"
            onClick={navigateToFollowups}
          />
        </View>

        <View className={styles.statsRow}>
          <StatCard
            title="VIP客户"
            value={customers.filter((c) => c.level === 'vip').length}
            color="warning"
          />
          <StatCard
            title="待跟进"
            value={getPendingFollowups()}
            subtitle={todayFollowups.length > 0 ? `${todayFollowups.length}个今日待处理` : '暂无待办'}
            color="error"
          />
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>快捷操作</Text>
          </View>
          <View className={styles.quickActions}>
            <View className={styles.actionCard} onClick={navigateToAddCustomer}>
              <View className={styles.actionIcon}>
                <Text className={styles.actionIconText}>👤</Text>
              </View>
              <Text className={styles.actionLabel}>新增客户</Text>
            </View>
            <View className={styles.actionCard} onClick={navigateToAddFollowup}>
              <View className={styles.actionIcon}>
                <Text className={styles.actionIconText}>📝</Text>
              </View>
              <Text className={styles.actionLabel}>记录跟进</Text>
            </View>
            <View className={styles.actionCard} onClick={navigateToCustomers}>
              <View className={styles.actionIcon}>
                <Text className={styles.actionIconText}>📋</Text>
              </View>
              <Text className={styles.actionLabel}>客户列表</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日待跟进</Text>
            <Text className={styles.sectionMore} onClick={navigateToFollowups}>查看全部</Text>
          </View>
          {todayFollowups.length > 0 ? (
            <View className={styles.todayList}>
              {todayFollowups.slice(0, 5).map((customer) => (
                <View
                  key={customer.id}
                  className={styles.todayItem}
                  onClick={() => handleCustomerClick(customer.id)}
                >
                  <View className={styles.todayAvatar}>
                    <Text className={styles.todayAvatarText}>{customer.name.charAt(0)}</Text>
                  </View>
                  <View className={styles.todayInfo}>
                    <Text className={styles.todayName}>{customer.name}</Text>
                    <Text className={styles.todayDesc}>{customer.company} · {customer.position}</Text>
                  </View>
                  <View className={styles.todayTag}>
                    <Text className={styles.todayTagText}>
                      {isOverdue(customer.nextFollowupAt) && !isToday(customer.nextFollowupAt) ? '已逾期' : '今日'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              title="今日暂无待跟进"
              description="好好享受轻松的一天吧~"
            />
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>近期跟进动态</Text>
            <Text className={styles.sectionMore} onClick={navigateToFollowups}>查看全部</Text>
          </View>
          {recentFollowups.length > 0 ? (
            recentFollowups.map((followup) => (
              <FollowupCard key={followup.id} followup={followup} />
            ))
          ) : (
            <EmptyState title="暂无跟进记录" />
          )}
        </View>
      </View>

      <Button className={styles.fab} onClick={navigateToAddCustomer}>
        <Text className={styles.fabText}>+</Text>
      </Button>
    </ScrollView>
  );
};

export default HomePage;
