import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Customer, Followup, CUSTOMER_LEVELS, CUSTOMER_SOURCES } from '../../types';
import { getStorage, STORAGE_KEYS, formatDate, isToday, isOverdue } from '../../utils/storage';
import { mockCustomers, mockFollowups } from '../../data/mock';
import StatCard from '../../components/StatCard';
import styles from './index.module.scss';

const StatisticsPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);

  const loadData = useCallback(() => {
    console.log('[Statistics] Loading data...');
    let storedCustomers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    let storedFollowups = getStorage<Followup[]>(STORAGE_KEYS.FOLLOWUPS, []);

    if (storedCustomers.length === 0) {
      storedCustomers = mockCustomers;
    }
    if (storedFollowups.length === 0) {
      storedFollowups = mockFollowups;
    }

    setCustomers(storedCustomers);
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

  const statistics = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const newCustomersThisMonth = customers.filter(
      (c) => new Date(c.createdAt) >= thisMonthStart
    ).length;

    const followupsThisMonth = followups.filter(
      (f) => new Date(f.followupAt) >= thisMonthStart
    ).length;

    const pendingFollowups = customers.filter(
      (c) => c.nextFollowupAt && (isToday(c.nextFollowupAt) || isOverdue(c.nextFollowupAt))
    ).length;

    const vipCount = customers.filter((c) => c.level === 'vip').length;

    const levelDistribution = CUSTOMER_LEVELS.map((level) => ({
      level: level.label,
      count: customers.filter((c) => c.level === level.value).length,
      color: level.color,
    })).filter((item) => item.count > 0);

    const sourceColors = ['#165dff', '#00b42a', '#ff7d00', '#f53f3f', '#722ed1', '#86909c'];
    const sourceDistribution = CUSTOMER_SOURCES.map((source, index) => ({
      source: source.label,
      count: customers.filter((c) => c.source === source.value).length,
      color: sourceColors[index % sourceColors.length],
    })).filter((item) => item.count > 0);

    const trendDays = 7;
    const followupTrend = Array.from({ length: trendDays }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (trendDays - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = followups.filter((f) => f.followupAt.startsWith(dateStr)).length;
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        count,
      };
    });

    const maxTrendValue = Math.max(...followupTrend.map((t) => t.count), 1);

    return {
      totalCustomers: customers.length,
      newCustomersThisMonth,
      totalFollowups: followups.length,
      followupsThisMonth,
      pendingFollowups,
      vipCount,
      levelDistribution,
      sourceDistribution,
      followupTrend,
      maxTrendValue,
    };
  }, [customers, followups]);

  const maxLevelCount = Math.max(...statistics.levelDistribution.map((l) => l.count), 1);
  const maxSourceCount = Math.max(...statistics.sourceDistribution.map((s) => s.count), 1);

  const getPieBackground = (distribution: { count: number; color: string }[]) => {
    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) return '#e5e6eb';

    let currentAngle = 0;
    const stops: string[] = [];

    distribution.forEach((item) => {
      const angle = (item.count / total) * 360;
      stops.push(`${item.color} ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    });

    return `conic-gradient(${stops.join(', ')})`;
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
      onScrollToUpper={handleRefresh}
    >
      <View className={styles.statsGrid}>
        <StatCard
          title="客户总数"
          value={statistics.totalCustomers}
          subtitle={`本月新增 ${statistics.newCustomersThisMonth}`}
          color="primary"
        />
        <StatCard
          title="跟进总数"
          value={statistics.totalFollowups}
          subtitle={`本月 ${statistics.followupsThisMonth}次`}
          color="success"
        />
        <StatCard
          title="VIP客户"
          value={statistics.vipCount}
          color="warning"
        />
        <StatCard
          title="待跟进"
          value={statistics.pendingFollowups}
          color="error"
        />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📊 客户等级分布</Text>
        {statistics.levelDistribution.length > 0 ? (
          <View className={styles.chartContainer}>
            <View className={styles.pieChart}>
              <View
                className={styles.pieVisual}
                style={{ background: getPieBackground(statistics.levelDistribution) }}
              >
                <View className={styles.pieCenter}>
                  <Text className={styles.pieCenterText}>{statistics.totalCustomers}</Text>
                </View>
              </View>
              <View className={styles.pieLegend}>
                {statistics.levelDistribution.map((item, index) => (
                  <View key={index} className={styles.legendItem}>
                    <View className={styles.legendDot} style={{ background: item.color }} />
                    <Text className={styles.legendLabel}>{item.level}</Text>
                    <Text className={styles.legendValue}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <Text className={styles.emptyTip}>暂无数据</Text>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📈 客户来源分布</Text>
        {statistics.sourceDistribution.length > 0 ? (
          <View className={styles.chartContainer}>
            <View className={styles.barChart}>
              {statistics.sourceDistribution.map((item, index) => (
                <View key={index} className={styles.barItem}>
                  <Text className={styles.barLabel}>{item.source}</Text>
                  <View className={styles.barTrack}>
                    <View
                      className={styles.barFill}
                      style={{
                        width: `${(item.count / maxSourceCount) * 100}%`,
                        background: item.color,
                      }}
                    />
                  </View>
                  <Text className={styles.barValue}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text className={styles.emptyTip}>暂无数据</Text>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📅 近7天跟进趋势</Text>
        <View className={styles.chartContainer}>
          <View className={styles.trendChart}>
            {statistics.followupTrend.map((item, index) => (
              <View key={index} className={styles.trendBar}>
                <View
                  className={styles.trendBarFill}
                  style={{ height: `${(item.count / statistics.maxTrendValue) * 100}%` }}
                >
                  {item.count > 0 && (
                    <Text className={styles.trendBarValue}>{item.count}</Text>
                  )}
                </View>
                <Text className={styles.trendBarLabel}>{item.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📋 数据汇总</Text>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>客户总数</Text>
          <Text className={styles.summaryValue}>{statistics.totalCustomers} 人</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>本月新增客户</Text>
          <Text className={styles.summaryValue}>{statistics.newCustomersThisMonth} 人</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>跟进记录总数</Text>
          <Text className={styles.summaryValue}>{statistics.totalFollowups} 条</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>本月跟进次数</Text>
          <Text className={styles.summaryValue}>{statistics.followupsThisMonth} 次</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>待跟进客户</Text>
          <Text className={styles.summaryValue}>{statistics.pendingFollowups} 人</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>VIP客户占比</Text>
          <Text className={styles.summaryValue}>
            {statistics.totalCustomers > 0
              ? ((statistics.vipCount / statistics.totalCustomers) * 100).toFixed(1)
              : 0}%
          </Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>数据更新时间</Text>
          <Text className={styles.summaryValue}>{formatDate(new Date(), 'MM-DD HH:mm')}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default StatisticsPage;
