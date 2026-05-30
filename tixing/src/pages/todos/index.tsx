import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { useTodoStore } from '@/store/todoStore';
import TodoCard from '@/components/TodoCard';
import styles from './index.module.scss';

type TabType = 'pending' | 'completed';

const TodosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const { 
    pendingTodos, 
    completedTodos, 
    toggleComplete, 
    deleteTodo, 
    checkAndRemind,
    loading 
  } = useTodoStore();

  const displayTodos = activeTab === 'pending' ? pendingTodos : completedTodos;

  useEffect(() => {
    const timer = setInterval(() => {
      checkAndRemind();
    }, 30000);

    checkAndRemind();

    return () => clearInterval(timer);
  }, [checkAndRemind]);

  usePullDownRefresh(async () => {
    await checkAndRemind();
    Taro.stopPullDownRefresh();
  });

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条待办吗？',
      success: (res) => {
        if (res.confirm) {
          deleteTodo(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  if (loading) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>⏳</Text>
          <Text className={styles.emptyText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>我的待办</Text>
        <Text className={styles.subtitle}>
          {pendingTodos.length > 0 
            ? `还有 ${pendingTodos.length} 项待完成` 
            : '暂无待办事项，去添加一个吧~'}
        </Text>
      </View>

      <View className={styles.tabs}>
        <Button
          className={classnames(styles.tab, activeTab === 'pending' && styles.activeTab)}
          onClick={() => setActiveTab('pending')}
        >
          进行中
          <Text className={styles.countBadge}>{pendingTodos.length}</Text>
        </Button>
        <Button
          className={classnames(styles.tab, activeTab === 'completed' && styles.activeTab)}
          onClick={() => setActiveTab('completed')}
        >
          已完成
          <Text className={styles.countBadge}>{completedTodos.length}</Text>
        </Button>
      </View>

      <ScrollView scrollY className={styles.list}>
        {displayTodos.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>
              {activeTab === 'pending' ? '📝' : '🎉'}
            </Text>
            <Text className={styles.emptyText}>
              {activeTab === 'pending' ? '暂无待办事项' : '还没有完成的任务'}
            </Text>
          </View>
        ) : (
          displayTodos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={toggleComplete}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default TodosPage;
