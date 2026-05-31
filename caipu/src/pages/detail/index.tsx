import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter, useDidShow } from '@tarojs/taro';
import { useRecipe } from '@/store/recipeContext';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const { getRecipeById, deleteRecipe, recipes } = useRecipe();
  const id = router.params.id as string;
  const [recipe, setRecipe] = useState(() => getRecipeById(id));

  useDidShow(() => {
    const latest = getRecipeById(id);
    console.log('[DetailPage] useDidShow, recipe:', latest);
    setRecipe(latest);
  });

  useEffect(() => {
    const latest = getRecipeById(id);
    console.log('[DetailPage] useEffect, recipe:', latest, 'id:', id);
    setRecipe(latest);
  }, [id, recipes]);

  if (!recipe) {
    return (
      <View className={styles.container}>
        <View style={{ padding: '80rpx', textAlign: 'center' }}>
          <Text>菜谱不存在</Text>
        </View>
      </View>
    );
  }

  const handleEdit = () => {
    Taro.navigateTo({
      url: `/pages/edit/index?id=${recipe.id}`
    });
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除「${recipe.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          deleteRecipe(recipe.id);
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.heroImage}>
        <Image
          className={styles.recipeImage}
          src={recipe.image}
          mode='aspectFill'
          onError={(e) => console.error('[DetailPage] Image load error:', e)}
        />
        <View className={styles.imageOverlay} />
        <View className={styles.headerInfo}>
          <Text className={styles.recipeName}>{recipe.name}</Text>
          <View className={styles.categoryTag}>
            <Text className={styles.tagText}>{recipe.category}</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🥗</Text>
            <Text>配料清单</Text>
          </View>
          <View className={styles.ingredientList}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} className={styles.ingredientItem}>
                <View className={styles.ingredientDot} />
                <Text className={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>👨‍🍳</Text>
            <Text>烹饪步骤</Text>
          </View>
          <View className={styles.stepList}>
            {recipe.steps.map((step, index) => (
              <View key={index} className={styles.stepItem}>
                <View className={styles.stepNumber}>
                  <Text className={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View className={styles.stepContent}>
                  <Text className={styles.stepText}>{step}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {recipe.remark && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>💡</Text>
              <Text>小贴士</Text>
            </View>
            <View className={styles.remarkBox}>
              <Text className={recipe.remark ? styles.remarkText : styles.emptyRemark}>
                {recipe.remark || '暂无备注'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.actionBar}>
        <Button className={styles.editBtn} onClick={handleEdit}>
          <Text className={styles.editText}>编辑菜谱</Text>
        </Button>
        <Button className={styles.deleteBtn} onClick={handleDelete}>
          <Text className={styles.deleteText}>删除菜谱</Text>
        </Button>
      </View>
    </View>
  );
};

export default DetailPage;
