import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useRouter, useDidShow } from '@tarojs/taro';
import { useRecipe } from '@/store/recipeContext';
import { CATEGORIES, RecipeCategory, RecipeFormData } from '@/types/recipe';
import styles from './index.module.scss';

const EditPage: React.FC = () => {
  const router = useRouter();
  const { addRecipe, updateRecipe, getRecipeById, recipes } = useRecipe();
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    category: '其他',
    image: '',
    ingredients: '',
    steps: '',
    remark: ''
  });

  useDidShow(() => {
    const id = router.params.id as string;
    console.log('[EditPage] useDidShow, id from router:', id, 'router.params:', router.params);
    setEditId(id);
  });

  useEffect(() => {
    const id = router.params.id as string;
    console.log('[EditPage] useEffect, id from router:', id);
    setEditId(id);
  }, [router.params.id]);

  useEffect(() => {
    console.log('[EditPage] useEffect on editId change, editId:', editId);
    Taro.setNavigationBarTitle({
      title: editId ? '编辑菜谱' : '新增菜谱'
    });
    if (editId) {
      const recipe = getRecipeById(editId);
      console.log('[EditPage] got recipe:', recipe);
      if (recipe) {
        setFormData({
          name: recipe.name,
          category: recipe.category,
          image: recipe.image,
          ingredients: recipe.ingredients.join('\n'),
          steps: recipe.steps.join('\n'),
          remark: recipe.remark
        });
      }
    } else {
      setFormData({
        name: '',
        category: '其他',
        image: '',
        ingredients: '',
        steps: '',
        remark: ''
      });
    }
  }, [editId, recipes]);

  const handleInputChange = (field: keyof RecipeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (category: RecipeCategory) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleImageUpload = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setFormData(prev => ({ ...prev, image: tempFilePath }));
      },
      fail: (error) => {
        console.error('[EditPage] chooseImage error:', error);
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Taro.showToast({
        title: '请输入菜谱名称',
        icon: 'none'
      });
      return;
    }

    if (!formData.ingredients.trim()) {
      Taro.showToast({
        title: '请输入配料',
        icon: 'none'
      });
      return;
    }

    if (!formData.steps.trim()) {
      Taro.showToast({
        title: '请输入步骤',
        icon: 'none'
      });
      return;
    }

    if (editId) {
      updateRecipe(editId, formData);
      Taro.showToast({
        title: '修改成功',
        icon: 'success'
      });
    } else {
      addRecipe(formData);
      Taro.showToast({
        title: '添加成功',
        icon: 'success'
      });
    }

    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  return (
    <View className={styles.container}>
      <View className={styles.form}>
        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>基本信息</Text>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>菜谱名称</Text>
            <Input
              className={styles.input}
              placeholder='请输入菜谱名称'
              value={formData.name}
              onInput={(e) => handleInputChange('name', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>菜系分类</Text>
            <View className={styles.categoryList}>
              {CATEGORIES.map((category) => (
                <View
                  key={category}
                  className={classnames(
                    styles.categoryItem,
                    formData.category === category && styles.categoryItemActive
                  )}
                  onClick={() => handleCategorySelect(category)}
                >
                  <Text
                    className={classnames(
                      styles.categoryText,
                      formData.category === category && styles.categoryTextActive
                    )}
                  >
                    {category}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>菜品图片</Text>
            <View className={styles.imageUpload} onClick={handleImageUpload}>
              {formData.image ? (
                <Image
                  className={styles.imagePreview}
                  src={formData.image}
                  mode='aspectFill'
                  onError={(e) => console.error('[EditPage] Image load error:', e)}
                />
              ) : (
                <>
                  <Text className={styles.uploadIcon}>📷</Text>
                  <Text className={styles.uploadText}>点击上传图片</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>配料清单</Text>
          <View className={styles.formItem}>
            <Text className={styles.label}>配料（每行一种）</Text>
            <Textarea
              className={styles.textarea}
              placeholder='例如：&#10;豆腐 400g&#10;牛肉末 100g&#10;豆瓣酱 2勺'
              value={formData.ingredients}
              onInput={(e) => handleInputChange('ingredients', e.detail.value)}
            />
            <Text className={styles.hint}>提示：每行输入一种配料，包含名称和用量</Text>
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>烹饪步骤</Text>
          <View className={styles.formItem}>
            <Text className={styles.label}>步骤（每行一步）</Text>
            <Textarea
              className={styles.textarea}
              placeholder='例如：&#10;豆腐切成小块，放入开水中焯水&#10;锅中放油，下入肉末炒至变色&#10;加入调料翻炒均匀'
              value={formData.steps}
              onInput={(e) => handleInputChange('steps', e.detail.value)}
            />
            <Text className={styles.hint}>提示：每行输入一个烹饪步骤</Text>
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>备注</Text>
          <View className={styles.formItem}>
            <Textarea
              className={styles.textarea}
              placeholder='添加小贴士、技巧或其他备注信息...'
              value={formData.remark}
              onInput={(e) => handleInputChange('remark', e.detail.value)}
            />
          </View>
        </View>
      </View>

      <Button className={styles.submitBtn} onClick={handleSubmit}>
        <Text className={styles.submitText}>{editId ? '保存修改' : '添加菜谱'}</Text>
      </Button>
    </View>
  );
};

export default EditPage;
