import { QueryClient, QueryFunction } from "@tanstack/react-query";
import * as storage from "./localStorage";

// Local storage query functions that simulate API responses
const localStorageQueryFn: QueryFunction = async ({ queryKey }) => {
  const [endpoint, ...params] = queryKey as string[];
  
  switch (endpoint) {
    case '/api/transactions':
      return storage.getTransactionsForMonth().map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toString(),
        category: t.category,
        description: t.description || '',
        date: t.date
      }));
      
    case '/api/budgets':
      const budgets = storage.getBudgetsForMonth();
      const transactions = storage.getTransactionsForMonth();
      
      return budgets.map(budget => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0);
          
        const remaining = budget.budgetAmount - spent;
        const percentage = (spent / budget.budgetAmount) * 100;
        
        return {
          id: budget.id,
          category: budget.category,
          budgetAmount: budget.budgetAmount.toString(),
          actualSpent: spent.toString(),
          remaining: remaining.toString(),
          percentage: percentage.toString(),
          isOverBudget: spent > budget.budgetAmount
        };
      });
      
    case '/api/goals':
      return storage.getGoals().map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount.toString(),
        currentAmount: g.currentAmount.toString(),
        targetDate: g.targetDate,
        percentage: ((g.currentAmount / g.targetAmount) * 100).toString()
      }));
      
    case '/api/analytics/categories':
      const { categories } = storage.getAnalyticsData();
      return categories.map(c => ({
        category: c.category,
        amount: c.amount.toString()
      }));
      
    case '/api/analytics/summary':
      const { summary } = storage.getAnalyticsData();
      return {
        totalBalance: summary.totalBalance.toString(),
        monthlyIncome: summary.monthlyIncome.toString(),
        monthlyExpenses: summary.monthlyExpenses.toString(),
        transactionCount: summary.transactionCount.toString()
      };
      
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
};

// Local storage mutation function
export const localStorageMutation = async (
  method: string,
  url: string,
  data?: unknown
) => {
  const [, , endpoint, ...params] = url.split('/');
  
  switch (method.toUpperCase()) {
    case 'POST':
      switch (endpoint) {
        case 'transactions':
          const transactionData = data as any;
          return storage.saveTransaction({
            type: transactionData.type,
            amount: parseFloat(transactionData.amount),
            category: transactionData.category,
            description: transactionData.description,
            date: transactionData.date
          });
          
        case 'budgets':
          const budgetData = data as any;
          return storage.saveBudget({
            category: budgetData.category,
            budgetAmount: parseFloat(budgetData.budgetAmount)
          });
          
        case 'goals':
          const goalData = data as any;
          return storage.saveGoal({
            name: goalData.name,
            targetAmount: parseFloat(goalData.targetAmount),
            currentAmount: parseFloat(goalData.currentAmount || '0'),
            targetDate: goalData.targetDate
          });
          
        default:
          throw new Error(`Unknown POST endpoint: ${endpoint}`);
      }
      
    case 'PATCH':
      switch (endpoint) {
        case 'goals':
          const goalId = params[0];
          const updates = data as any;
          storage.updateGoal(goalId, {
            currentAmount: parseFloat(updates.currentAmount)
          });
          return { success: true };
          
        default:
          throw new Error(`Unknown PATCH endpoint: ${endpoint}`);
      }
      
    case 'DELETE':
      switch (endpoint) {
        case 'transactions':
          const transactionId = params[0];
          storage.deleteTransaction(transactionId);
          return { success: true };
          
        case 'budgets':
          const budgetId = params[0];
          storage.deleteBudget(budgetId);
          return { success: true };
          
        case 'goals':
          const goalIdToDelete = params[0];
          storage.deleteGoal(goalIdToDelete);
          return { success: true };
          
        default:
          throw new Error(`Unknown DELETE endpoint: ${endpoint}`);
      }
      
    default:
      throw new Error(`Unknown method: ${method}`);
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: localStorageQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Always refetch from localStorage
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});