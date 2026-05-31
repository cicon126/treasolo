import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import WordCard from '@/components/WordCard';
import { useDictionaryStore } from '@/store/dictionary';
import { getWordsByIds } from '@/utils/dictionary';
import styles from './index.module.scss';

const VocabularyPage: React.FC = () => {
  const { vocabularyIds } = useDictionaryStore();
  const words = getWordsByIds(vocabularyIds);

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>我的词汇本</Text>
        <Text className={styles.headerCount}>已收藏 {words.length} 个词汇</Text>
      </View>

      <View className={styles.listSection}>
        {words.length > 0 ? (
          words.map((word) => (
            <WordCard key={word.id} word={word} showFull />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📚</Text>
            <Text className={styles.emptyText}>还没有收藏任何词汇</Text>
            <Text className={styles.emptyHint}>在查询页面点击☆收藏单词吧</Text>
          </View>
        )}
      </View>

      <View className={styles.bottomSpace} />
    </ScrollView>
  );
};

export default VocabularyPage;
