import React, { useState } from 'react';
import { View, Text, Button, Textarea, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useTodoStore } from '@/store/todoStore';
import { reminder } from '@/utils/reminder';
import styles from './index.module.scss';

const AddPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [remindTime, setRemindTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const { addTodo, settings } = useTodoStore();

  const getDefaultDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const quickTimes = [
    { label: '1小时后', getValue: () => addHours(1) },
    { label: '2小时后', getValue: () => addHours(2) },
    { label: '今天晚上', getValue: () => getTonight() },
    { label: '明天早上', getValue: () => getTomorrowMorning() },
    { label: '明天下午', getValue: () => getTomorrowAfternoon() },
  ];

  const addHours = (hours: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return formatDateTime(date);
  };

  const getTonight = () => {
    const date = new Date();
    date.setHours(20, 0, 0, 0);
    return formatDateTime(date);
  };

  const getTomorrowMorning = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    return formatDateTime(date);
  };

  const getTomorrowAfternoon = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(14, 0, 0, 0);
    return formatDateTime(date);
  };

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleQuickSelect = (getValue: () => string) => {
    setRemindTime(getValue());
    Taro.vibrateShort({ type: 'light' });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.detail.value);
    if (selectedTime) {
      setRemindTime(`${e.detail.value} ${selectedTime}`);
    } else {
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.detail.value);
    if (selectedDate) {
      setRemindTime(`${selectedDate} ${e.detail.value}`);
    }
  };

  const openDateTimePicker = () => {
    setSelectedDate(getDefaultDate());
    setSelectedTime(getDefaultTime());
    setShowDatePicker(true);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入待办内容', icon: 'none' });
      return;
    }
    if (!remindTime) {
      Taro.showToast({ title: '请选择提醒时间', icon: 'none' });
      return;
    }

    const remindDate = new Date(remindTime);
    if (remindDate.getTime() < Date.now()) {
      Taro.showToast({ title: '提醒时间不能早于当前时间', icon: 'none' });
      return;
    }

    try {
      await addTodo(content.trim(), remindTime);
      Taro.showToast({ title: '添加成功', icon: 'success' });
      setContent('');
      setRemindTime('');
      
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/todos/index' });
      }, 1000);
    } catch (error) {
      console.error('[AddPage] addTodo error:', error);
      Taro.showToast({ title: '添加失败，请重试', icon: 'none' });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.card}>
        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.labelIcon}>📝</Text>
            待办内容
          </Text>
          <Textarea
            className={styles.textarea}
            placeholder="请输入需要提醒的事项内容..."
            placeholderTextColor="#C9CDD4"
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={200}
            autoHeight
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.labelIcon}>⏰</Text>
            提醒时间
          </Text>
          
          <Picker
            mode="date"
            value={selectedDate || getDefaultDate()}
            onChange={handleDateChange}
          >
            <View
              className={classnames(styles.timePicker, remindTime && styles.timePickerActive)}
              onClick={openDateTimePicker}
            >
              {remindTime ? (
                <Text className={styles.timeValue}>{reminder.formatTime(remindTime)}</Text>
              ) : (
                <Text className={styles.timePlaceholder}>点击选择提醒时间</Text>
              )}
              <Text className={styles.timeArrow}>›</Text>
            </View>
          </Picker>

          {showDatePicker && (
            <Picker
              mode="time"
              value={selectedTime || getDefaultTime()}
              onChange={handleTimeChange}
            >
              <View style={{ display: 'none' }} />
            </Picker>
          )}

          <View className={styles.quickTimes}>
            {quickTimes.map((item, index) => (
              <Button
                key={index}
                className={styles.quickBtn}
                onClick={() => handleQuickSelect(item.getValue)}
              >
                {item.label}
              </Button>
            ))}
          </View>
        </View>

        <Button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!content.trim() || !remindTime}
        >
          添加待办
        </Button>
      </View>

      <View className={styles.tips}>
        <Text className={styles.tipTitle}>💡 温馨提示</Text>
        <Text className={styles.tipText}>
          {settings.enableReminder 
            ? `已开启提醒功能，将在事项前${settings.remindAdvanceMinutes}分钟弹窗提醒` 
            : '提醒功能已关闭，可在设置中开启'}
          {settings.enableVoice && '，并进行语音播报'}
        </Text>
      </View>
    </View>
  );
};

export default AddPage;
