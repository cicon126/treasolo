import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useHealthStore } from '@/store/useHealthStore';
import { getToday, getNow, getRelativeDateLabel } from '@/utils/dateUtils';
import type { MetricType, HealthRecord } from '@/types/health';
import styles from './index.module.scss';

const tabs: { key: MetricType; label: string; icon: string }[] = [
  { key: 'weight', label: '体重', icon: '⚖️' },
  { key: 'bloodPressure', label: '血压', icon: '🩺' },
  { key: 'bloodSugar', label: '血糖', icon: '🩸' },
  { key: 'heartRate', label: '心率', icon: '❤️' }
];

const RecordPage: React.FC = () => {
  const { records, profile, addRecord, getTodayRecord } = useHealthStore();
  const todayRecord = getTodayRecord();

  const [activeTab, setActiveTab] = useState<MetricType>('weight');
  const [weight, setWeight] = useState(todayRecord?.weight?.toString() || '');
  const [systolic, setSystolic] = useState(todayRecord?.systolic?.toString() || '');
  const [diastolic, setDiastolic] = useState(todayRecord?.diastolic?.toString() || '');
  const [bloodSugar, setBloodSugar] = useState(todayRecord?.bloodSugar?.toString() || '');
  const [heartRate, setHeartRate] = useState(todayRecord?.heartRate?.toString() || '');

  const handleSubmit = () => {
    const record: HealthRecord = {
      id: Date.now().toString(),
      date: getToday(),
      time: getNow(),
      weight: weight ? parseFloat(weight) : undefined,
      systolic: systolic ? parseInt(systolic) : undefined,
      diastolic: diastolic ? parseInt(diastolic) : undefined,
      bloodSugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined
    };

    if (!record.weight && !record.systolic && !record.bloodSugar && !record.heartRate) {
      Taro.showToast({ title: '请至少输入一项数据', icon: 'none' });
      return;
    }

    if (todayRecord) {
      record.id = todayRecord.id;
    }

    addRecord(record);
    Taro.showToast({ title: '保存成功', icon: 'success' });

    setTimeout(() => {
      Taro.switchTab({ url: '/pages/home/index' });
    }, 1500);
  };

  const recentRecords = records.slice(0, 5);

  const formatMetricValues = (record: HealthRecord) => {
    const items: string[] = [];
    if (record.weight) items.push(`体重 ${record.weight}kg`);
    if (record.systolic && record.diastolic) items.push(`血压 ${record.systolic}/${record.diastolic}`);
    if (record.bloodSugar) items.push(`血糖 ${record.bloodSugar}`);
    if (record.heartRate) items.push(`心率 ${record.heartRate}`);
    return items;
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'weight':
        return (
          <View className={styles.formSection}>
            <View className={styles.formTitle}>
              <Text className={styles.formIcon}>⚖️</Text>
              <Text>体重记录</Text>
            </View>
            <View className={styles.inputGroup}>
              <Text className={styles.inputLabel}>
                体重
                <Text className={styles.inputLabelUnit}>kg</Text>
              </Text>
              <View className={styles.inputWrap}>
                <Input
                  className={styles.input}
                  type="digit"
                  placeholder="请输入体重"
                  value={weight}
                  onInput={(e) => setWeight(e.detail.value)}
                />
              </View>
              <View className={styles.normalRange}>
                正常BMI范围：18.5-24（您的身高：{profile.height}cm）
              </View>
            </View>
          </View>
        );
      case 'bloodPressure':
        return (
          <View className={styles.formSection}>
            <View className={styles.formTitle}>
              <Text className={styles.formIcon}>🩺</Text>
              <Text>血压记录</Text>
            </View>
            <View className={styles.rowInputs}>
              <View className={styles.rowInputItem}>
                <Text className={styles.inputLabel}>
                  收缩压
                  <Text className={styles.inputLabelUnit}>mmHg</Text>
                </Text>
                <View className={styles.inputWrap}>
                  <Input
                    className={styles.input}
                    type="digit"
                    placeholder="高压"
                    value={systolic}
                    onInput={(e) => setSystolic(e.detail.value)}
                  />
                </View>
              </View>
              <View className={styles.rowInputItem}>
                <Text className={styles.inputLabel}>
                  舒张压
                  <Text className={styles.inputLabelUnit}>mmHg</Text>
                </Text>
                <View className={styles.inputWrap}>
                  <Input
                    className={styles.input}
                    type="digit"
                    placeholder="低压"
                    value={diastolic}
                    onInput={(e) => setDiastolic(e.detail.value)}
                  />
                </View>
              </View>
            </View>
            <View className={styles.normalRange}>
              正常血压范围：收缩压 90-140 / 舒张压 60-90 mmHg
            </View>
          </View>
        );
      case 'bloodSugar':
        return (
          <View className={styles.formSection}>
            <View className={styles.formTitle}>
              <Text className={styles.formIcon}>🩸</Text>
              <Text>血糖记录</Text>
            </View>
            <View className={styles.inputGroup}>
              <Text className={styles.inputLabel}>
                空腹血糖
                <Text className={styles.inputLabelUnit}>mmol/L</Text>
              </Text>
              <View className={styles.inputWrap}>
                <Input
                  className={styles.input}
                  type="digit"
                  placeholder="请输入血糖值"
                  value={bloodSugar}
                  onInput={(e) => setBloodSugar(e.detail.value)}
                />
              </View>
              <View className={styles.normalRange}>
                正常空腹血糖范围：3.9-6.1 mmol/L
              </View>
            </View>
          </View>
        );
      case 'heartRate':
        return (
          <View className={styles.formSection}>
            <View className={styles.formTitle}>
              <Text className={styles.formIcon}>❤️</Text>
              <Text>心率记录</Text>
            </View>
            <View className={styles.inputGroup}>
              <Text className={styles.inputLabel}>
                心率
                <Text className={styles.inputLabelUnit}>次/分</Text>
              </Text>
              <View className={styles.inputWrap}>
                <Input
                  className={styles.input}
                  type="digit"
                  placeholder="请输入心率"
                  value={heartRate}
                  onInput={(e) => setHeartRate(e.detail.value)}
                />
              </View>
              <View className={styles.normalRange}>
                正常心率范围：60-100 次/分
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.dateSection}>
        <Text className={styles.dateLabel}>记录日期</Text>
        <Text className={styles.dateValue}>{getToday()}</Text>
      </View>

      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tab, activeTab === tab.key && styles.tabActive)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={classnames(styles.tabText, activeTab === tab.key && styles.tabTextActive)}>
              {tab.icon} {tab.label}
            </Text>
          </View>
        ))}
      </View>

      {renderForm()}

      <View className={styles.submitBtn} onClick={handleSubmit}>
        <Text className={styles.submitBtnText}>保存记录</Text>
      </View>

      <View className={styles.historySection}>
        <Text className={styles.historyTitle}>最近记录</Text>
        {recentRecords.map((record) => (
          <View key={record.id} className={styles.historyItem}>
            <Text className={styles.historyDate}>
              {getRelativeDateLabel(record.date)} {record.time}
            </Text>
            <View className={styles.historyMetrics}>
              {formatMetricValues(record).map((text, i) => (
                <View key={i} className={styles.historyMetric}>
                  <Text className={styles.historyMetricText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default RecordPage;
