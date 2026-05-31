export type RecipeCategory = 
  | '川菜' 
  | '粤菜' 
  | '苏菜' 
  | '鲁菜' 
  | '浙菜' 
  | '闽菜' 
  | '湘菜' 
  | '徽菜' 
  | '其他';

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  image: string;
  ingredients: string[];
  steps: string[];
  remark: string;
  createdAt: number;
  updatedAt: number;
}

export interface RecipeFormData {
  name: string;
  category: RecipeCategory;
  image: string;
  ingredients: string;
  steps: string;
  remark: string;
}

export const CATEGORIES: RecipeCategory[] = [
  '川菜',
  '粤菜',
  '苏菜',
  '鲁菜',
  '浙菜',
  '闽菜',
  '湘菜',
  '徽菜',
  '其他'
];
