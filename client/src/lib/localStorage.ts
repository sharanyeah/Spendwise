// Local storage utilities for finance app data persistence

export interface StoredTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  month: string; // Format: "2025-01"
}

export interface StoredBudget {
  id: string;
  category: string;
  budgetAmount: number;
  month: string; // Format: "2025-01"
}

export interface StoredGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

// Get current month in YYYY-MM format
export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Generic localStorage functions
const getStoredData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const setStoredData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Transaction functions
export const getTransactions = (): StoredTransaction[] => {
  return getStoredData<StoredTransaction>('spendwise_transactions');
};

export const getTransactionsForMonth = (month?: string): StoredTransaction[] => {
  const targetMonth = month || getCurrentMonth();
  return getTransactions().filter(t => t.month === targetMonth);
};

export const saveTransaction = (transaction: Omit<StoredTransaction, 'id' | 'month'>): StoredTransaction => {
  const transactions = getTransactions();
  const newTransaction: StoredTransaction = {
    ...transaction,
    id: Date.now().toString(),
    month: getCurrentMonth()
  };
  transactions.push(newTransaction);
  setStoredData('spendwise_transactions', transactions);
  return newTransaction;
};

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  setStoredData('spendwise_transactions', filtered);
};

// Budget functions
export const getBudgets = (): StoredBudget[] => {
  return getStoredData<StoredBudget>('spendwise_budgets');
};

export const getBudgetsForMonth = (month?: string): StoredBudget[] => {
  const targetMonth = month || getCurrentMonth();
  return getBudgets().filter(b => b.month === targetMonth);
};

export const saveBudget = (budget: Omit<StoredBudget, 'id' | 'month'>): StoredBudget => {
  const budgets = getBudgets();
  const currentMonth = getCurrentMonth();
  
  // Check if budget exists for this category in current month
  const existingIndex = budgets.findIndex(b => b.category === budget.category && b.month === currentMonth);
  
  if (existingIndex >= 0) {
    // Update existing budget
    budgets[existingIndex] = { ...budgets[existingIndex], ...budget };
    setStoredData('spendwise_budgets', budgets);
    return budgets[existingIndex];
  } else {
    // Create new budget
    const newBudget: StoredBudget = {
      ...budget,
      id: Date.now().toString(),
      month: currentMonth
    };
    budgets.push(newBudget);
    setStoredData('spendwise_budgets', budgets);
    return newBudget;
  }
};

export const deleteBudget = (id: string): void => {
  const budgets = getBudgets();
  const filtered = budgets.filter(b => b.id !== id);
  setStoredData('spendwise_budgets', filtered);
};

// Goal functions
export const getGoals = (): StoredGoal[] => {
  return getStoredData<StoredGoal>('spendwise_goals');
};

export const saveGoal = (goal: Omit<StoredGoal, 'id'>): StoredGoal => {
  const goals = getGoals();
  const newGoal: StoredGoal = {
    ...goal,
    id: Date.now().toString()
  };
  goals.push(newGoal);
  setStoredData('spendwise_goals', goals);
  return newGoal;
};

export const updateGoal = (id: string, updates: Partial<StoredGoal>): void => {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index >= 0) {
    goals[index] = { ...goals[index], ...updates };
    setStoredData('spendwise_goals', goals);
  }
};

export const deleteGoal = (id: string): void => {
  const goals = getGoals();
  const filtered = goals.filter(g => g.id !== id);
  setStoredData('spendwise_goals', filtered);
};

// Analytics functions
export const getAnalyticsData = (month?: string) => {
  const transactions = getTransactionsForMonth(month);
  
  // Category breakdown
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categories = Object.entries(categoryData).map(([category, amount]) => ({
    category,
    amount
  }));

  // Summary
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const summary = {
    totalBalance: totalIncome - totalExpenses,
    monthlyIncome: totalIncome,
    monthlyExpenses: totalExpenses,
    transactionCount: transactions.length
  };

  return { categories, summary };
};