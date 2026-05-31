import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SearchBar from '@/components/SearchBar';
import WordCard from '@/components/WordCard';
import { useDictionaryStore } from '@/store/dictionary';
import { searchWords, getDailyWord, isChinese } from '@/utils/dictionary';
import type { WordEntry } from '@/types/dictionary';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<WordEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { addSearchHistory } = useDictionaryStore();

  const dailyWord = getDailyWord();

  const handleSearch = useCallback((keyword: string) => {
    console.info('[Home] Searching:', keyword);
    const lang = isChinese(keyword) ? '中文' : '英文';
    console.info('[Home] Detected language:', lang);
    const results = searchWords(keyword);
    setSearchResults(results);
    setHasSearched(true);
    setSearchKeyword(keyword);
    addSearchHistory(keyword);

    if (results.length === 0) {
      Taro.showToast({
        title: '未找到相关词汇',
        icon: 'none',
        duration: 1500
      });
    }
  }, [addSearchHistory]);

  const handleHotWordClick = useCallback((word: string) => {
    handleSearch(word);
  }, [handleSearch]);

  const hotWords = ['serendipity', 'resilience', '怀旧', '务实', 'ephemeral', 'compassion'];

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>英汉词典</Text>
        <Text className={styles.headerDesc}>输入中文或英文，智能识别语言，快速查询</Text>
      </View>

      <View className={styles.searchSection}>
        <SearchBar onSearch={handleSearch} />
        <View className={styles.langHint}>
          <View className={styles.langDot} />
          <Text className={styles.langHintText}>自动识别中英文 · 支持模糊搜索</Text>
        </View>
      </View>

      {hasSearched ? (
        <View className={styles.resultsSection}>
          <View className={styles.resultsHeader}>
            <Text className={styles.resultsTitle}>查询结果</Text>
            <Text className={styles.resultsCount}>共{searchResults.length}个</Text>
          </View>
          {searchResults.length > 0 ? (
            searchResults.map((word) => (
              <WordCard key={word.id} word={word} showFull />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📖</Text>
              <Text className={styles.emptyText}>未找到「{searchKeyword}」的相关结果</Text>
              <Text className={styles.emptyHint}>试试其他关键词吧</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <View className={styles.dailySection}>
            <View className={styles.dailyHeader}>
              <View className={styles.dailyLabel}>
                <Text className={styles.dailyLabelText}>每日一词</Text>
              </View>
              <Text className={styles.dailyDate}>
                {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <View className={styles.dailyWord}>
              <Text className={styles.dailyEnglish}>{dailyWord.english}</Text>
              <Text className={styles.dailyPhonetic}>{dailyWord.phonetic}</Text>
            </View>
            <Text className={styles.dailyChinese}>{dailyWord.chinese}</Text>
            {dailyWord.examples.length > 0 && (
              <View className={styles.dailyExample}>
                <Text className={styles.dailyExampleEn}>{dailyWord.examples[0].english}</Text>
                <Text className={styles.dailyExampleZh}>{dailyWord.examples[0].chinese}</Text>
              </View>
            )}
          </View>

          <Text className={styles.sectionTitle}>热门查询</Text>
          <View className={styles.hotWordsSection}>
            <View className={styles.hotWordsWrap}>
              {hotWords.map((word, index) => (
                <View key={index} className={styles.hotWordTag} onClick={() => handleHotWordClick(word)}>
                  <Text className={styles.hotWordText}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      <View className={styles.bottomSpace} />
    </ScrollView>
  );
};

export default HomePage;
