import { Category } from '../types/category';

export const loadCategories = (): Category[] => {
  try {
    const stored = localStorage.getItem('arise-categories');
    if (!stored) return [];
    
    const categories = JSON.parse(stored);
    return categories.map((category: any) => ({
      ...category,
      createdAt: new Date(category.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load categories from localStorage:', error);
    return [];
  }
};