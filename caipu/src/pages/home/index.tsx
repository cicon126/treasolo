import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import { useRecipe } from '@/store/recipeContext';
import { CATEGORIES } from '@/types/recipe';
import RecipeCard from '@/components/RecipeCard';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { recipes, loading, searchRecipes, getRecipesByCategory, deleteRecipe } = useRecipe();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [displayRecipes, setDisplayRecipes] = useState(recipes);

  useEffect(() => {
    filterRecipes();
  }, [searchKeyword, activeCategory, recipes]);

  const filterRecipes = () => {
    let result = recipes;
    if (searchKeyword) {
      result = searchRecipes(searchKeyword);
    } else if (activeCategory !== '全部') {
      result = getRecipesByCategory(activeCategory);
    }
    setDisplayRecipes(result);
  };

  const handleDelete = (id: string, name: string) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除「${name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          deleteRecipe(id);
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleAdd = () => {
    Taro.navigateTo({
      url: '/pages/edit/index'
    });
  };

  usePullDownRefresh(() => {
    Taro.stopPullDownRefresh();
  });

  if (loading) {
    return (
      <View className={styles.container}>
        <View className={styles.loading}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder='搜索菜谱名称或食材'
          value={searchKeyword}
          onInput={(e) => setSearchKeyword(e.detail.value)}
          confirmType='search'
        />
      </View>

      <ScrollView
        className={styles.categoryScroll}
        scrollX
        showScrollbar={false}
      >
        <View className={styles.categoryList}>
          <View
            className={classnames(
              styles.categoryItem,
              activeCategory === '全部' && styles.categoryItemActive
            )}
            onClick={() => {
              setActiveCategory('全部');
              setSearchKeyword('');
            }}
          >
            <Text
              className={classnames(
                styles.categoryText,
                activeCategory === '全部' && styles.categoryTextActive
              )}
            >
              全部
            </Text>
          </View>
          {CATEGORIES.map((category) => (
            <View
              key={category}
              className={classnames(
                styles.categoryItem,
                activeCategory === category && styles.categoryItemActive
              )}
              onClick={() => {
                setActiveCategory(category);
                setSearchKeyword('');
              }}
            >
              <Text
                className={classnames(
                  styles.categoryText,
                  activeCategory === category && styles.categoryTextActive
                )}
              >
                {category}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {displayRecipes.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🍳</Text>
          <Text className={styles.emptyText}>暂无菜谱，快去添加吧</Text>
        </View>
      ) : (
        <View className={styles.recipeList}>
          {displayRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              showDelete
              onDelete={() => handleDelete(recipe.id, recipe.name)}
            />
          ))}
        </View>
      )}

      <Button className={styles.addBtn} onClick={handleAdd}>
        <Text className={styles.addBtnText}>+ 新增菜谱</Text>
      </Button>
    </View>
  );
};

export default HomePage;
