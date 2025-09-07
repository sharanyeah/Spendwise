import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import { getCategoryIcon, getCategoryColor, EXPENSE_CATEGORIES } from "@/lib/categories";
import { localStorageMutation } from "@/lib/localStorageClient";
import { useToast } from "@/hooks/use-toast";
import type { Budget, Transaction } from "@shared/schema";

export default function BudgetPage() {
  const [budgetModal, setBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    budgetAmount: '',
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ['/api/budgets'],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const createBudget = useMutation({
    mutationFn: async (data: { category: string; budgetAmount: number }) => {
      return await localStorageMutation('POST', '/api/budgets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      toast({
        title: "Budget created",
        description: "Your budget has been set successfully.",
      });
      setBudgetModal(false);
      setBudgetForm({ category: '', budgetAmount: '' });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      await localStorageMutation('DELETE', `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      toast({
        title: "Budget deleted",
        description: "Budget has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate actual spending for each category
  const currentMonthExpenses = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return t.type === 'expense' &&
           transactionDate.getMonth() + 1 === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const categorySpending = currentMonthExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const budgetData = budgets.map(budget => {
    const spent = categorySpending[budget.category] || 0;
    const percentage = (spent / parseFloat(budget.budgetAmount)) * 100;
    const remaining = parseFloat(budget.budgetAmount) - spent;
    const isOverBudget = spent > parseFloat(budget.budgetAmount);
    
    return {
      ...budget,
      actualSpent: spent,
      percentage,
      remaining,
      isOverBudget,
    };
  });

  const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.budgetAmount), 0);
  const totalSpent = budgetData.reduce((sum, budget) => sum + budget.actualSpent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budgetForm.category || !budgetForm.budgetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.category === budgetForm.category);
    if (existingBudget) {
      toast({
        title: "Error",
        description: "Budget already exists for this category.",
        variant: "destructive",
      });
      return;
    }

    createBudget.mutate({
      category: budgetForm.category,
      budgetAmount: parseFloat(budgetForm.budgetAmount),
    });
  };

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleDateString('en-IN', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen">
      <header className="bg-card border-b border-border px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">Budget Management</h1>
            <p className="text-base text-muted-foreground mt-1">Set and monitor your spending limits for {monthName}</p>
          </div>
          <Button 
            onClick={() => setBudgetModal(true)}
            data-testid="create-budget-button"
          >
            <i className="fas fa-plus mr-2"></i>
            Set Budget
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold text-primary" data-testid="total-budget">
                    {formatCurrency(totalBudget)}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <i className="fas fa-calculator text-primary text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="total-spent">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <div className="bg-destructive/10 p-3 rounded-full">
                  <i className="fas fa-arrow-down text-destructive text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-primary' : 'text-destructive'}`} data-testid="total-remaining">
                    {formatCurrency(Math.abs(totalRemaining))}
                  </p>
                  {totalRemaining < 0 && <p className="text-xs text-destructive">Over budget!</p>}
                </div>
                <div className={`p-3 rounded-full ${totalRemaining >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                  <i className={`fas fa-wallet ${totalRemaining >= 0 ? 'text-primary' : 'text-destructive'} text-xl`}></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Budget Categories</h3>
              <span className="text-sm text-muted-foreground" data-testid="budget-count">
                {budgets.length} categories
              </span>
            </div>

            {budgetsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div>
                          <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                          <div className="h-3 bg-muted rounded w-32"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                        <div className="w-24 bg-muted rounded-full h-2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : budgetData.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-calculator text-4xl text-muted-foreground mb-4"></i>
                <p className="text-xl font-semibold mb-2">No budgets set</p>
                <p className="text-base text-muted-foreground mb-4">
                  Create category budgets to monitor and control your spending
                </p>
                <Button onClick={() => setBudgetModal(true)} data-testid="create-first-budget">
                  <i className="fas fa-plus mr-2"></i>
                  Set Your First Budget
                </Button>
              </div>
            ) : (
              <div className="space-y-4" data-testid="budget-list">
                {budgetData.map((budget) => (
                  <div key={budget.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <i className={`${getCategoryIcon(budget.category, 'expense')} ${getCategoryColor(budget.category, 'expense')}`}></i>
                      </div>
                      <div>
                        <p className="font-medium capitalize">{budget.category.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(budget.actualSpent)} of {formatCurrency(budget.budgetAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${budget.isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                          {budget.isOverBudget 
                            ? `${formatCurrency(Math.abs(budget.remaining))} over!` 
                            : `${formatCurrency(budget.remaining)} left`
                          }
                        </p>
                        <div className="w-24 bg-primary/20 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              budget.isOverBudget ? 'bg-destructive' : 'bg-primary'
                            }`}
                            style={{ width: `${Math.max(Math.min(budget.percentage, 100), budget.actualSpent > 0 ? 5 : 0)}%` }}
                          ></div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBudget.mutate(budget.id)}
                        disabled={deleteBudget.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-testid={`delete-budget-${budget.id}`}
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={budgetModal} onOpenChange={setBudgetModal}>
        <DialogContent className="sm:max-w-md" data-testid="budget-modal">
          <DialogHeader>
            <DialogTitle>Set Budget</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={budgetForm.category}
                onValueChange={(value) => setBudgetForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger data-testid="budget-category-select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => {
                    const hasExistingBudget = budgets.some(b => b.category === category.id);
                    return (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        disabled={hasExistingBudget}
                      >
                        <div className="flex items-center">
                          <i className={`${category.icon} mr-2`}></i>
                          {category.name}
                          {hasExistingBudget && <span className="ml-2 text-xs text-muted-foreground">(exists)</span>}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budgetAmount">Budget Amount (₹)</Label>
              <Input
                id="budgetAmount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter budget amount"
                value={budgetForm.budgetAmount}
                onChange={(e) => setBudgetForm(prev => ({ ...prev, budgetAmount: e.target.value }))}
                data-testid="budget-amount-input"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBudgetModal(false)}
                className="flex-1"
                data-testid="budget-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createBudget.isPending}
                data-testid="budget-submit-button"
              >
                {createBudget.isPending ? "Setting..." : "Set Budget"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
