export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'fas fa-utensils', color: 'text-primary' },
  { id: 'transport', name: 'Transport', icon: 'fas fa-bus', color: 'text-yellow-500' },
  { id: 'entertainment', name: 'Entertainment', icon: 'fas fa-gamepad', color: 'text-purple-500' },
  { id: 'shopping', name: 'Shopping', icon: 'fas fa-shopping-bag', color: 'text-blue-500' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'fas fa-file-invoice-dollar', color: 'text-red-500' },
  { id: 'healthcare', name: 'Healthcare', icon: 'fas fa-heartbeat', color: 'text-pink-500' },
  { id: 'education', name: 'Education', icon: 'fas fa-graduation-cap', color: 'text-indigo-500' },
  { id: 'travel', name: 'Travel', icon: 'fas fa-plane', color: 'text-green-500' },
  { id: 'other-expense', name: 'Other', icon: 'fas fa-ellipsis-h', color: 'text-purple-600' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: 'fas fa-briefcase', color: 'text-primary' },
  { id: 'freelance', name: 'Freelance', icon: 'fas fa-laptop', color: 'text-blue-500' },
  { id: 'business', name: 'Business', icon: 'fas fa-building', color: 'text-green-500' },
  { id: 'investment', name: 'Investment', icon: 'fas fa-chart-line', color: 'text-purple-500' },
  { id: 'other-income', name: 'Other', icon: 'fas fa-plus-circle', color: 'text-purple-600' },
];

export const getCategoryById = (categoryId: string, type: 'income' | 'expense'): Category | undefined => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return categories.find(cat => cat.id === categoryId);
};

export const getCategoryIcon = (categoryId: string, type: 'income' | 'expense'): string => {
  const category = getCategoryById(categoryId, type);
  return category?.icon || 'fas fa-circle';
};

export const getCategoryColor = (categoryId: string, type: 'income' | 'expense'): string => {
  const category = getCategoryById(categoryId, type);
  return category?.color || 'text-purple-600';
};
