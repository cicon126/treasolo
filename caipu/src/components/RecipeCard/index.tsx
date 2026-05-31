import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { Recipe } from '@/types/recipe';
import styles from './index.module.scss';

interface RecipeCardProps {
  recipe: Recipe;
  showDelete?: boolean;
  onDelete?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, showDelete = false, onDelete }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${recipe.id}`
    });
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.imageWrap} onClick={handleClick}>
        <Image
          className={styles.image}
          src={recipe.image}
          mode='aspectFill'
          onError={(e) => console.error('[RecipeCard] Image load error:', e)}
        />
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{recipe.name}</Text>
          <View className={styles.tag}>
            <Text className={styles.tagText}>{recipe.category}</Text>
          </View>
        </View>
        <Text className={styles.ingredients}>
          {recipe.ingredients.slice(0, 3).join('、')}...
        </Text>
        <View className={styles.footer}>
          <Text className={styles.stepCount}>{recipe.steps.length}个步骤</Text>
          {showDelete && (
            <View className={styles.deleteBtn} onClick={handleDelete}>
              <Text className={styles.deleteText}>删除</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default RecipeCard;
