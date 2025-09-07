import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { getCategoryIcon, getCategoryColor, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { localStorageMutation } from "@/lib/localStorageClient";
import { useToast } from "@/hooks/use-toast";
import TransactionModal from "@/components/transaction-modal";
import type { Transaction } from "@shared/schema";

export default function Transactions() {
  const [transactionModal, setTransactionModal] = useState({ open: false, type: 'expense' as 'income' | 'expense' });
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      await localStorageMutation('DELETE', `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/categories'] });
      toast({
        title: "Transaction deleted",
        description: "Transaction has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesCategory = filters.category === 'all' || transaction.category === filters.category;

    return matchesSearch && matchesType && matchesCategory;
  });

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const openTransactionModal = (type: 'income' | 'expense') => {
    setTransactionModal({ open: true, type });
  };

  return (
    <div className="min-h-screen">
      <header className="bg-card border-b border-border px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">Transactions</h1>
            <p className="text-base text-muted-foreground mt-1">Track and manage your financial transactions</p>
          </div>
          <Button 
            onClick={() => openTransactionModal('expense')}
            data-testid="add-transaction-header"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Transaction
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <Card className="shadow-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  data-testid="search-transactions"
                  className="border-2 border-black"
                />
              </div>

              <div>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger data-testid="filter-type">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger data-testid="filter-category">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Array.from(new Set(transactions.map(t => t.category))).map((category) => (
                      <SelectItem key={`category-${category}`} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ search: '', type: 'all', category: 'all' })}
                  className="w-full"
                  data-testid="clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
            onClick={() => openTransactionModal('income')}
            data-testid="quick-add-income"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Income
          </Button>
          <Button 
            variant="outline"
            className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
            onClick={() => openTransactionModal('expense')}
            data-testid="quick-add-expense"
          >
            <i className="fas fa-minus mr-2"></i>
            Add Expense
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">All Transactions</h3>
              <span className="text-sm text-muted-foreground" data-testid="transaction-count">
                {filteredTransactions.length} transactions
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div>
                          <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                          <div className="h-3 bg-muted rounded w-20"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-receipt text-4xl text-muted-foreground mb-4"></i>
                <p className="text-xl font-semibold mb-2">No transactions found</p>
                <p className="text-base text-muted-foreground mb-4">
                  {filters.search || filters.type !== 'all' || filters.category !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Start by adding your first transaction'
                  }
                </p>
                <Button onClick={() => openTransactionModal('expense')} data-testid="add-first-transaction">
                  <i className="fas fa-plus mr-2"></i>
                  Add Transaction
                </Button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="transactions-list">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' ? 'bg-accent/10' : 'bg-primary/10'
                      }`}>
                        <i className={`${getCategoryIcon(transaction.category, transaction.type as 'income' | 'expense')} ${getCategoryColor(transaction.category, transaction.type as 'income' | 'expense')} text-sm`}></i>
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description || transaction.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-accent' : 'text-destructive'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTransaction.mutate(transaction.id)}
                        disabled={deleteTransaction.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-testid={`delete-transaction-${transaction.id}`}
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

      <TransactionModal 
        open={transactionModal.open} 
        onOpenChange={(open) => setTransactionModal(prev => ({ ...prev, open }))} 
        initialType={transactionModal.type}
      />
    </div>
  );
}