import React from 'react';
import { View, Text, ScrollView, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRecipe } from '@/store/recipeContext';
import { CATEGORIES } from '@/types/recipe';
import styles from './index.module.scss';

const categoryIcons: Record<string, string> = {
  '川菜': '🌶️',
  '粤菜': '🥢',
  '苏菜': '🍲',
  '鲁菜': '🍗',
  '浙菜': '🐟',
  '闽菜': '🦐',
  '湘菜': '🌶️',
  '徽菜': '🍄',
  '其他': '🍽️'
};

const CategoryPage: React.FC = () => {
  const { getRecipesByCategory } = useRecipe();

  const handleRecipeClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  };

  const handleAdd = () => {
    Taro.navigateTo({
      url: '/pages/edit/index'
    });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      {CATEGORIES.map((category) => {
        const recipes = getRecipesByCategory(category);
        return (
          <View key={category} className={styles.categorySection}>
            <View className={styles.categoryHeader}>
              <View className={styles.categoryTitle}>
                <Text className={styles.categoryIcon}>{categoryIcons[category]}</Text>
                <Text className={styles.categoryName}>{category}</Text>
              </View>
              <Text className={styles.categoryCount}>{recipes.length} 道菜</Text>
            </View>

            {recipes.length === 0 ? (
              <View className={styles.emptyCategory}>
                <Text className={styles.emptyText}>暂无菜谱</Text>
              </View>
            ) : (
              <ScrollView
                className={styles.recipeScroll}
                scrollX
                showScrollbar={false}
              >
                <View className={styles.recipeRow}>
                  {recipes.map((recipe) => (
                    <View
                      key={recipe.id}
                      className={styles.recipeCard}
                      onClick={() => handleRecipeClick(recipe.id)}
                    >
                      <View
                        className={styles.cardImageWrap}
                        onClick={() => handleRecipeClick(recipe.id)}
                      >
                        <Image
                          className={styles.cardImage}
                          src={recipe.image}
                          mode='aspectFill'
                          onError={(e) => console.error('[CategoryPage] Image load error:', e)}
                        />
                      </View>
                      <View className={styles.cardContent}>
                        <Text className={styles.cardName}>{recipe.name}</Text>
                        <Text className={styles.cardInfo}>{recipe.steps.length}个步骤</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        );
      })}

      <Button className={styles.addBtn} onClick={handleAdd}>
        <Text className={styles.addBtnText}>+ 新增菜谱</Text>
      </Button>
    </ScrollView>
  );
};

export default CategoryPage;
