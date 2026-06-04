import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { useHealthStore } from '@/store/useHealthStore';
import { calcBMI, getBMIStatus, getBPStatus, getBloodSugarStatus, getHeartRateStatus } from '@/utils/healthCalculator';
import { formatDate } from '@/utils/dateUtils';
import type { MetricType } from '@/types/health';
import styles from './index.module.scss';

type Period = 7 | 30 | 90;

const metricTabs: { key: MetricType; label: string; color: string }[] = [
  { key: 'weight', label: '⚖️ 体重', color: '#FF7D00' },
  { key: 'bloodPressure', label: '🩺 血压', color: '#3491FA' },
  { key: 'bloodSugar', label: '🩸 血糖', color: '#F53F3F' },
  { key: 'heartRate', label: '❤️ 心率', color: '#722ED1' }
];

const TrendsPage: React.FC = () => {
  const { records, profile } = useHealthStore();
  const [period, setPeriod] = useState<Period>(7);
  const [activeMetric, setActiveMetric] = useState<MetricType>('weight');

  const filteredRecords = useMemo(() => {
    return records.slice(0, period);
  }, [records, period]);

  const chartData = useMemo(() => {
    const data: { date: string; value: number; label: string }[] = [];
    filteredRecords.forEach((r) => {
      let value: number | undefined;
      switch (activeMetric) {
        case 'weight':
          value = r.weight;
          break;
        case 'bloodPressure':
          value = r.systolic;
          break;
        case 'bloodSugar':
          value = r.bloodSugar;
          break;
        case 'heartRate':
          value = r.heartRate;
          break;
      }
      if (value !== undefined) {
        data.push({
          date: r.date,
          value,
          label: formatDate(r.date, 'MM/DD')
        });
      }
    });
    return data;
  }, [filteredRecords, activeMetric]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return { avg: 0, max: 0, min: 0, trend: 'stable' as const };
    const values = chartData.map((d) => d.value);
    const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const first = values[0];
    const last = values[values.length - 1];
    const diff = last - first;
    const trend = Math.abs(diff) < 0.3 ? 'stable' as const : diff > 0 ? 'up' as const : 'down' as const;
    return { avg, max, min, trend };
  }, [chartData]);

  const barChartData = useMemo(() => {
    if (chartData.length === 0) return [];
    const values = chartData.map((d) => d.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const range = maxVal - minVal || 1;
    const displayCount = Math.min(chartData.length, period <= 7 ? 7 : 14);
    const step = Math.max(1, Math.floor(chartData.length / displayCount));
    const result: { label: string; height: number; value: number }[] = [];
    for (let i = 0; i < chartData.length && result.length < displayCount; i += step) {
      const d = chartData[i];
      const height = Math.max(10, ((d.value - minVal) / range) * 80 + 20);
      result.push({ label: d.label, height, value: d.value });
    }
    return result;
  }, [chartData, period]);

  const activeMetricConfig = metricTabs.find((m) => m.key === activeMetric)!;

  const getTrendText = () => {
    switch (stats.trend) {
      case 'up':
        return '↑ 上升';
      case 'down':
        return '↓ 下降';
      case 'stable':
        return '→ 平稳';
    }
  };

  const getTrendClass = () => {
    switch (stats.trend) {
      case 'up':
        return styles.trendUp;
      case 'down':
        return styles.trendDown;
      case 'stable':
        return styles.trendStable;
    }
  };

  const getUnit = () => {
    switch (activeMetric) {
      case 'weight': return 'kg';
      case 'bloodPressure': return 'mmHg';
      case 'bloodSugar': return 'mmol/L';
      case 'heartRate': return 'bpm';
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.periodTabs}>
        {([7, 30, 90] as Period[]).map((p) => (
          <View
            key={p}
            className={classnames(styles.periodTab, period === p && styles.periodTabActive)}
            onClick={() => setPeriod(p)}
          >
            <Text className={classnames(styles.periodTabText, period === p && styles.periodTabTextActive)}>
              {p}天
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.metricTabs}>
        {metricTabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.metricTab, activeMetric === tab.key && styles.metricTabActive)}
            onClick={() => setActiveMetric(tab.key)}
          >
            <Text className={classnames(styles.metricTabText, activeMetric === tab.key && styles.metricTabTextActive)}>
              {tab.label}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.summaryCards}>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>平均值</Text>
          <Text className={styles.summaryValue}>{stats.avg}</Text>
          <Text className={styles.summaryUnit}>{getUnit()}</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>最高值</Text>
          <Text className={styles.summaryValue}>{stats.max}</Text>
          <Text className={styles.summaryUnit}>{getUnit()}</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>趋势</Text>
          <Text className={classnames(styles.summaryValue, getTrendClass())}>{getTrendText()}</Text>
        </View>
      </View>

      <View className={styles.chartCard}>
        <Text className={styles.chartTitle}>{activeMetricConfig.label}趋势</Text>
        <View className={styles.chartArea}>
          <View className={styles.chartBars}>
            {barChartData.map((bar, i) => (
              <View key={i} className={styles.barWrapper}>
                <View
                  className={styles.bar}
                  style={{
                    height: `${bar.height}%`,
                    backgroundColor: activeMetricConfig.color
                  }}
                />
                <Text className={styles.barLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.detailSection}>
        <Text className={styles.detailTitle}>详细数据</Text>
        {filteredRecords.slice(0, 10).map((record) => {
          let value = '--';
          let statusColor = '#86909C';
          switch (activeMetric) {
            case 'weight': {
              if (record.weight) {
                value = `${record.weight} kg`;
                const bmi = calcBMI(record.weight, profile.height);
                statusColor = getBMIStatus(bmi).color;
              }
              break;
            }
            case 'bloodPressure': {
              if (record.systolic && record.diastolic) {
                value = `${record.systolic}/${record.diastolic}`;
                statusColor = getBPStatus(record.systolic, record.diastolic).color;
              }
              break;
            }
            case 'bloodSugar': {
              if (record.bloodSugar) {
                value = `${record.bloodSugar} mmol/L`;
                statusColor = getBloodSugarStatus(record.bloodSugar).color;
              }
              break;
            }
            case 'heartRate': {
              if (record.heartRate) {
                value = `${record.heartRate} bpm`;
                statusColor = getHeartRateStatus(record.heartRate).color;
              }
              break;
            }
          }
          return (
            <View key={record.id} className={styles.detailRow}>
              <Text className={styles.detailLabel}>{formatDate(record.date, 'MM月DD日')}</Text>
              <Text className={styles.detailValue} style={{ color: statusColor }}>{value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TrendsPage;
