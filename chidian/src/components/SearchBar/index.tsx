import React, { useState, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import styles from './index.module.scss';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch: (keyword: string) => void;
  onChange?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '输入中文或英文查询...',
  value = '',
  onSearch,
  onChange
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInput = (e) => {
    const val = e.detail.value;
    setInputValue(val);
    onChange?.(val);
  };

  const handleSearch = () => {
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
  };

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  return (
    <View className={styles.searchBar}>
      <View className={styles.searchInputWrap}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder={placeholder}
          placeholderClass={styles.placeholder}
          value={inputValue}
          onInput={handleInput}
          onConfirm={handleConfirm}
          confirmType='search'
        />
        {inputValue && (
          <View className={styles.clearBtn} onClick={handleClear}>
            <Text className={styles.clearIcon}>✕</Text>
          </View>
        )}
      </View>
      <View className={styles.searchBtn} onClick={handleSearch}>
        <Text className={styles.searchBtnText}>查询</Text>
      </View>
    </View>
  );
};

export default SearchBar;
