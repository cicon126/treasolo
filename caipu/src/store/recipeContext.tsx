import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Recipe, RecipeFormData } from '@/types/recipe';
import { mockRecipes } from '@/data/mockRecipes';
import { getStorageRecipes, setStorageRecipes } from '@/utils/storage';

interface RecipeContextType {
  recipes: Recipe[];
  loading: boolean;
  addRecipe: (data: RecipeFormData) => void;
  updateRecipe: (id: string, data: RecipeFormData) => void;
  deleteRecipe: (id: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  getRecipesByCategory: (category: string) => Recipe[];
  searchRecipes: (keyword: string) => Recipe[];
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initRecipes();
  }, []);

  const initRecipes = async () => {
    try {
      const stored = await getStorageRecipes();
      if (stored && stored.length > 0) {
        setRecipes(stored);
      } else {
        setRecipes(mockRecipes);
        await setStorageRecipes(mockRecipes);
      }
    } catch (error) {
      console.error('[RecipeContext] initRecipes error:', error);
      setRecipes(mockRecipes);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipes = async (newRecipes: Recipe[]) => {
    setRecipes(newRecipes);
    await setStorageRecipes(newRecipes);
  };

  const addRecipe = (data: RecipeFormData) => {
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: data.name,
      category: data.category,
      image: data.image || 'https://picsum.photos/id/835/400/300',
      ingredients: data.ingredients.split('\n').filter(item => item.trim()),
      steps: data.steps.split('\n').filter(item => item.trim()),
      remark: data.remark,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    saveRecipes([newRecipe, ...recipes]);
    console.log('[RecipeContext] addRecipe success:', newRecipe.name);
  };

  const updateRecipe = (id: string, data: RecipeFormData) => {
    const updatedRecipes = recipes.map(recipe => {
      if (recipe.id === id) {
        return {
          ...recipe,
          name: data.name,
          category: data.category,
          image: data.image || recipe.image,
          ingredients: data.ingredients.split('\n').filter(item => item.trim()),
          steps: data.steps.split('\n').filter(item => item.trim()),
          remark: data.remark,
          updatedAt: Date.now()
        };
      }
      return recipe;
    });
    saveRecipes(updatedRecipes);
    console.log('[RecipeContext] updateRecipe success:', id);
  };

  const deleteRecipe = (id: string) => {
    const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
    saveRecipes(filteredRecipes);
    console.log('[RecipeContext] deleteRecipe success:', id);
  };

  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  const getRecipesByCategory = (category: string) => {
    if (category === '全部') return recipes;
    return recipes.filter(recipe => recipe.category === category);
  };

  const searchRecipes = (keyword: string) => {
    if (!keyword.trim()) return recipes;
    const lowerKeyword = keyword.toLowerCase();
    return recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(lowerKeyword) ||
      recipe.category.toLowerCase().includes(lowerKeyword) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerKeyword))
    );
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      loading,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      getRecipeById,
      getRecipesByCategory,
      searchRecipes
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
};
