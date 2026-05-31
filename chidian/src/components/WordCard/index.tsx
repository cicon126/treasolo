import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { useDictionaryStore } from '@/store/dictionary';
import type { WordEntry } from '@/types/dictionary';
import styles from './index.module.scss';

interface WordCardProps {
  word: WordEntry;
  showFull?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, showFull = false, onToggleFavorite }) => {
  const { isInVocabulary, addVocabulary, removeVocabulary } = useDictionaryStore();
  const isFavorite = isInVocabulary(word.id);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeVocabulary(word.id);
    } else {
      addVocabulary(word.id);
    }
    onToggleFavorite?.(word.id);
  };

  return (
    <View className={styles.wordCard}>
      <View className={styles.wordHeader}>
        <View className={styles.wordMain}>
          <Text className={styles.english}>{word.english}</Text>
          <Text className={styles.phonetic}>{word.phonetic}</Text>
        </View>
        <View className={classnames(styles.favoriteBtn, isFavorite && styles.favoriteActive)} onClick={handleToggleFavorite}>
          <Text className={styles.favoriteIcon}>{isFavorite ? '★' : '☆'}</Text>
        </View>
      </View>

      <View className={styles.chineseRow}>
        <Text className={styles.chinese}>{word.chinese}</Text>
        <Text className={styles.pinyin}>{word.pinyin}</Text>
      </View>

      {word.partsOfSpeech.map((pos, index) => (
        <View key={index} className={styles.posSection}>
          <View className={styles.posHeader}>
            <View className={styles.posTag}>
              <Text className={styles.posTagText}>{pos.chineseType}</Text>
            </View>
            <Text className={styles.posType}>{pos.type}</Text>
          </View>
          {pos.meanings.map((meaning, mIndex) => (
            <View key={mIndex} className={styles.meaningItem}>
              <Text className={styles.meaningIndex}>{mIndex + 1}.</Text>
              <View className={styles.meaningContent}>
                <Text className={styles.meaningChinese}>{meaning.chinese}</Text>
                <Text className={styles.meaningEnglish}>{meaning.english}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      {showFull && word.examples.length > 0 && (
        <View className={styles.examplesSection}>
          <Text className={styles.sectionTitle}>例句</Text>
          {word.examples.map((example, index) => (
            <View key={index} className={styles.exampleItem}>
              <Text className={styles.exampleEn}>{example.english}</Text>
              <Text className={styles.exampleZh}>{example.chinese}</Text>
            </View>
          ))}
        </View>
      )}

      {showFull && (word.synonyms.length > 0 || word.antonyms.length > 0) && (
        <View className={styles.relationsSection}>
          {word.synonyms.length > 0 && (
            <View className={styles.relationGroup}>
              <Text className={styles.relationLabel}>近义词</Text>
              <View className={styles.relationTags}>
                {word.synonyms.map((syn, index) => (
                  <View key={index} className={styles.relationTag}>
                    <Text className={styles.relationTagText}>{syn}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {word.antonyms.length > 0 && (
            <View className={styles.relationGroup}>
              <Text className={styles.relationLabel}>反义词</Text>
              <View className={styles.relationTags}>
                {word.antonyms.map((ant, index) => (
                  <View key={index} className={classnames(styles.relationTag, styles.antonymTag)}>
                    <Text className={classnames(styles.relationTagText, styles.antonymTagText)}>{ant}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default WordCard;
