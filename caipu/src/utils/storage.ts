import Taro from '@tarojs/taro';

const STORAGE_KEY = 'recipe_list';

export const getStorageRecipes = async () => {
  try {
    const data = await Taro.getStorage({ key: STORAGE_KEY });
    return data.data ? JSON.parse(data.data) : null;
  } catch (error) {
    console.error('[Storage] getStorageRecipes error:', error);
    return null;
  }
};

export const setStorageRecipes = async (recipes: any[]) => {
  try {
    await Taro.setStorage({
      key: STORAGE_KEY,
      data: JSON.stringify(recipes)
    });
    console.log('[Storage] setStorageRecipes success');
  } catch (error) {
    console.error('[Storage] setStorageRecipes error:', error);
  }
};

export const clearStorageRecipes = async () => {
  try {
    await Taro.removeStorage({ key: STORAGE_KEY });
    console.log('[Storage] clearStorageRecipes success');
  } catch (error) {
    console.error('[Storage] clearStorageRecipes error:', error);
  }
};
