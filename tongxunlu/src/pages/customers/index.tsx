import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Customer, CUSTOMER_LEVELS, CUSTOMER_SOURCES } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, isToday, isOverdue } from '../../utils/storage';
import { mockCustomers } from '../../data/mock';
import CustomerCard from '../../components/CustomerCard';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import styles from './index.module.scss';
import classnames from 'classnames';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeLevel, setActiveLevel] = useState<string>('all');
  const [activeSource, setActiveSource] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; customer: Customer | null }>({
    visible: false,
    customer: null,
  });

  const loadData = useCallback(() => {
    console.log('[Customers] Loading data...');
    let storedCustomers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);

    if (storedCustomers.length === 0) {
      console.log('[Customers] No customers found, loading mock data');
      storedCustomers = mockCustomers;
      setStorage(STORAGE_KEYS.CUSTOMERS, storedCustomers);
    }

    setCustomers(storedCustomers);
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

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          c.phone.includes(keyword) ||
          c.company.toLowerCase().includes(keyword)
      );
    }

    if (activeLevel !== 'all') {
      result = result.filter((c) => c.level === activeLevel);
    }

    if (activeSource !== 'all') {
      result = result.filter((c) => c.source === activeSource);
    }

    return result.sort((a, b) => {
      const aPriority = a.nextFollowupAt && (isToday(a.nextFollowupAt) || isOverdue(a.nextFollowupAt)) ? 0 : 1;
      const bPriority = b.nextFollowupAt && (isToday(b.nextFollowupAt) || isOverdue(b.nextFollowupAt)) ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [customers, searchKeyword, activeLevel, activeSource]);

  const groupedCustomers = useMemo(() => {
    const urgent: Customer[] = [];
    const normal: Customer[] = [];

    filteredCustomers.forEach((c) => {
      if (c.nextFollowupAt && (isToday(c.nextFollowupAt) || isOverdue(c.nextFollowupAt))) {
        urgent.push(c);
      } else {
        normal.push(c);
      }
    });

    return { urgent, normal };
  }, [filteredCustomers]);

  const handleAddCustomer = () => {
    Taro.navigateTo({ url: '/pages/customer-edit/index' });
  };

  const handleEditCustomer = (customer: Customer) => {
    Taro.navigateTo({ url: `/pages/customer-edit/index?id=${customer.id}` });
  };

  const handleDeleteClick = (customer: Customer) => {
    setDeleteModal({ visible: true, customer });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.customer) return;

    const updatedCustomers = customers.filter((c) => c.id !== deleteModal.customer!.id);
    setStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    setCustomers(updatedCustomers);
    setDeleteModal({ visible: false, customer: null });
    Taro.showToast({ title: '删除成功', icon: 'success' });
  };

  const handleAddFollowup = (customer: Customer) => {
    Taro.navigateTo({
      url: `/pages/followup-edit/index?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}`,
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.searchSection}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索客户名称、电话、公司"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        <View className={styles.filterRow}>
          <View
            className={classnames(styles.filterTag, activeLevel === 'all' && styles.active)}
            onClick={() => setActiveLevel('all')}
          >
            全部等级
          </View>
          {CUSTOMER_LEVELS.map((level) => (
            <View
              key={level.value}
              className={classnames(styles.filterTag, activeLevel === level.value && styles.active)}
              onClick={() => setActiveLevel(level.value)}
            >
              {level.label}
            </View>
          ))}
        </View>

        <View className={styles.filterRow}>
          <View
            className={classnames(styles.filterTag, activeSource === 'all' && styles.active)}
            onClick={() => setActiveSource('all')}
          >
            全部来源
          </View>
          {CUSTOMER_SOURCES.slice(0, 4).map((source) => (
            <View
              key={source.value}
              className={classnames(styles.filterTag, activeSource === source.value && styles.active)}
              onClick={() => setActiveSource(source.value)}
            >
              {source.label}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        scrollY
        onScrollToUpper={handleRefresh}
        className={styles.customerList}
      >
        {filteredCustomers.length > 0 ? (
          <>
            {groupedCustomers.urgent.length > 0 && (
              <>
                <Text className={styles.sectionTitle}>🔔 待跟进 ({groupedCustomers.urgent.length})</Text>
                {groupedCustomers.urgent.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteClick}
                    onAddFollowup={handleAddFollowup}
                  />
                ))}
              </>
            )}
            {groupedCustomers.normal.length > 0 && (
              <>
                <Text className={styles.sectionTitle}>📋 全部客户 ({groupedCustomers.normal.length})</Text>
                {groupedCustomers.normal.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteClick}
                    onAddFollowup={handleAddFollowup}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <EmptyState
            title="暂无客户"
            description={searchKeyword || activeLevel !== 'all' || activeSource !== 'all' ? '没有找到匹配的客户' : '点击下方按钮添加第一个客户'}
            actionText={searchKeyword || activeLevel !== 'all' || activeSource !== 'all' ? '清除筛选' : '新增客户'}
            onAction={() => {
              if (searchKeyword || activeLevel !== 'all' || activeSource !== 'all') {
                setSearchKeyword('');
                setActiveLevel('all');
                setActiveSource('all');
              } else {
                handleAddCustomer();
              }
            }}
          />
        )}
      </ScrollView>

      <Button className={styles.fab} onClick={handleAddCustomer}>
        <Text className={styles.fabText}>+</Text>
      </Button>

      <ConfirmModal
        visible={deleteModal.visible}
        title="确认删除"
        content={`确定要删除客户"${deleteModal.customer?.name}"吗？删除后无法恢复。`}
        confirmText="删除"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ visible: false, customer: null })}
      />
    </View>
  );
};

export default CustomersPage;
