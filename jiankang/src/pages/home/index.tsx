import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useHealthStore } from '@/store/useHealthStore';
import { calcHealthScore, generateAdvices, getBMIStatus, getBPStatus, getBloodSugarStatus, getHeartRateStatus, getScoreColor, getScoreLabel, calcBMI } from '@/utils/healthCalculator';
import { getToday, getRelativeDateLabel } from '@/utils/dateUtils';
import AdviceCard from '@/components/AdviceCard';
import styles from './index.module.scss';

const metricConfig = [
  { type: 'weight', icon: '⚖️', label: '体重', unit: 'kg', bgColor: '#FFF7E6', iconBg: '#FFF0D6' },
  { type: 'bloodPressure', icon: '🩺', label: '血压', unit: 'mmHg', bgColor: '#E8F3FF', iconBg: '#D6EAFF' },
  { type: 'bloodSugar', icon: '🩸', label: '血糖', unit: 'mmol/L', bgColor: '#FFF0F0', iconBg: '#FFE0E0' },
  { type: 'heartRate', icon: '❤️', label: '心率', unit: 'bpm', bgColor: '#F5E8FF', iconBg: '#EAD6FF' }
];

const HomePage: React.FC = () => {
  const { records, profile, getTodayRecord } = useHealthStore();
  const todayRecord = getTodayRecord();
  const today = getToday();

  const healthScore = useMemo(() => {
    if (todayRecord) {
      return calcHealthScore(todayRecord, profile);
    }
    return { total: 0, weightScore: 0, bpScore: 0, sugarScore: 0, heartScore: 0 };
  }, [todayRecord, profile]);

  const advices = useMemo(() => {
    if (todayRecord) {
      return generateAdvices(todayRecord, profile);
    }
    return [];
  }, [todayRecord, profile]);

  const getMetricStatus = (type: string) => {
    if (!todayRecord) return null;
    switch (type) {
      case 'weight': {
        if (!todayRecord.weight) return null;
        const bmi = calcBMI(todayRecord.weight, profile.height);
        return getBMIStatus(bmi);
      }
      case 'bloodPressure': {
        if (!todayRecord.systolic || !todayRecord.diastolic) return null;
        return getBPStatus(todayRecord.systolic, todayRecord.diastolic);
      }
      case 'bloodSugar': {
        if (!todayRecord.bloodSugar) return null;
        return getBloodSugarStatus(todayRecord.bloodSugar);
      }
      case 'heartRate': {
        if (!todayRecord.heartRate) return null;
        return getHeartRateStatus(todayRecord.heartRate);
      }
      default:
        return null;
    }
  };

  const getMetricValue = (type: string) => {
    if (!todayRecord) return null;
    switch (type) {
      case 'weight':
        return todayRecord.weight || null;
      case 'bloodPressure':
        return todayRecord.systolic && todayRecord.diastolic
          ? `${todayRecord.systolic}/${todayRecord.diastolic}`
          : null;
      case 'bloodSugar':
        return todayRecord.bloodSugar || null;
      case 'heartRate':
        return todayRecord.heartRate || null;
      default:
        return null;
    }
  };

  const goRecord = () => {
    Taro.switchTab({ url: '/pages/record/index' });
  };

  const lastRecord = records[0];
  const lastDate = lastRecord ? getRelativeDateLabel(lastRecord.date) : '';

  return (
    <View className={styles.page}>
      <View className={styles.greeting}>
        <Text className={styles.greetingText}>您好，{profile.name}</Text>
        <Text className={styles.greetingSub}>
          {todayRecord ? '今日数据已录入' : `上次记录：${lastDate || '暂无'}`}
        </Text>
      </View>

      <View className={styles.scoreSection}>
        <View className={styles.scoreCircle}>
          <Text className={styles.scoreNumber}>{healthScore.total || '--'}</Text>
          <Text className={styles.scoreLabel}>健康评分</Text>
        </View>
        <View className={styles.scoreInfo}>
          <Text className={styles.scoreTitle}>
            {healthScore.total ? getScoreLabel(healthScore.total) : '暂无评分'}
          </Text>
          <Text className={styles.scoreDesc}>
            {healthScore.total
              ? `您的综合健康评分${healthScore.total >= 80 ? '良好' : '需要关注'}，继续保持健康生活！`
              : '请录入今日健康数据，获取健康评分'}
          </Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>今日指标</Text>
      <View className={styles.metricsGrid}>
        {metricConfig.map((metric) => {
          const value = getMetricValue(metric.type);
          const status = getMetricStatus(metric.type);
          return (
            <View key={metric.type} className={styles.metricCard} onClick={goRecord}>
              <View className={styles.metricHeader}>
                <View className={styles.metricIcon} style={{ backgroundColor: metric.iconBg }}>
                  <Text>{metric.icon}</Text>
                </View>
                <Text className={styles.metricLabel}>{metric.label}</Text>
              </View>
              {value ? (
                <>
                  <View style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Text className={styles.metricValue}>{value}</Text>
                    {metric.type !== 'bloodPressure' && (
                      <Text className={styles.metricUnit}>{metric.unit}</Text>
                    )}
                  </View>
                  {status && (
                    <View className={styles.metricStatus} style={{ backgroundColor: status.color + '1A' }}>
                      <Text className={styles.metricStatusText} style={{ color: status.color }}>
                        {status.label}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text className={styles.noData}>点击录入</Text>
              )}
            </View>
          );
        })}
      </View>

      {advices.length > 0 && (
        <View className={styles.adviceSection}>
          <Text className={styles.sectionTitle}>健康建议</Text>
          <View className={styles.adviceList}>
            {advices.map((advice, idx) => (
              <AdviceCard
                key={idx}
                title={advice.title}
                description={advice.description}
                suggestions={advice.suggestions}
                level={advice.level}
              />
            ))}
          </View>
        </View>
      )}

      <View className={styles.recordBtn} onClick={goRecord}>
        <Text className={styles.recordBtnText}>{todayRecord ? '更新今日数据' : '录入今日数据'}</Text>
      </View>
    </View>
  );
};

export default HomePage;
