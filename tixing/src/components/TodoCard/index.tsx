import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import { TodoItem } from '@/types/todo';
import { reminder } from '@/utils/reminder';
import styles from './index.module.scss';

interface TodoCardProps {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onToggle, onDelete }) => {
  const isUrgent = () => {
    if (todo.isCompleted || todo.isReminded) return false;
    const now = new Date().getTime();
    const remindTime = new Date(todo.remindTime).getTime();
    const diffMinutes = (remindTime - now) / (1000 * 60);
    return diffMinutes > 0 && diffMinutes <= 30;
  };

  return (
    <View className={classnames(styles.card, todo.isCompleted && styles.completed)}>
      <View className={styles.header}>
        <View
          className={classnames(styles.checkbox, todo.isCompleted && styles.checked)}
          onClick={() => onToggle(todo.id)}
        >
          <Text className={styles.checkIcon}>✓</Text>
        </View>
        <View className={styles.contentWrap}>
          <Text className={classnames(styles.content, todo.isCompleted && styles.completedContent)}>
            {todo.content}
          </Text>
          <View className={styles.timeWrap}>
            <Text className={styles.timeIcon}>⏰</Text>
            <Text className={classnames(styles.time, isUrgent() && styles.urgent)}>
              {reminder.formatTime(todo.remindTime)}
              {todo.isReminded && ' (已提醒)'}
            </Text>
          </View>
        </View>
      </View>
      <View className={styles.footer}>
        <Button className={styles.deleteBtn} onClick={() => onDelete(todo.id)}>
          删除
        </Button>
      </View>
    </View>
  );
};

export default TodoCard;
