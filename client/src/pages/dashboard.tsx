import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { getCategoryIcon, getCategoryColor } from "@/lib/categories";
import TransactionModal from "@/components/transaction-modal";
import GoalModal from "@/components/goal-modal";
import type { Transaction, Goal } from "@shared/schema";

interface AnalyticsSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
}

interface CategoryAnalytics {
  category: string;
  amount: number;
}

export default function Dashboard() {
  const [transactionModal, setTransactionModal] = useState({ open: false, type: 'expense' as 'income' | 'expense' });
  const [goalModal, setGoalModal] = useState(false);

  const { data: summary } = useQuery<AnalyticsSummary>({
    queryKey: ['/api/analytics/summary'],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const { data: categories = [] } = useQuery<CategoryAnalytics[]>({
    queryKey: ['/api/analytics/categories'],
  });

  const recentTransactions = transactions.slice(0, 5);

  const openTransactionModal = (type: 'income' | 'expense') => {
    setTransactionModal({ open: true, type });
  };

  return (
    <div className="min-h-screen">
      <header className="glass-effect border-b border-border/40 px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight" data-testid="page-title">Financial Overview</h1>
            <p className="text-lg text-muted-foreground mt-2 font-medium">Monitor your financial progress and take control</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-sm border bg-gradient-to-br from-card to-secondary/30">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                  <p className="text-3xl font-bold text-primary mt-2" data-testid="total-balance">
                    {summary ? formatCurrency(summary.totalBalance) : '₹0'}
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border bg-gradient-to-br from-card to-accent/10">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                  <p className="text-3xl font-bold text-primary mt-2" data-testid="monthly-income">
                    {summary ? formatCurrency(summary.monthlyIncome) : '₹0'}
                  </p>
                </div>
                <div className="bg-accent/10 p-4 rounded-2xl">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border bg-gradient-to-br from-card to-destructive/10">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                  <p className="text-3xl font-bold text-destructive mt-2" data-testid="monthly-expenses">
                    {summary ? formatCurrency(summary.monthlyExpenses) : '₹0'}
                  </p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-2xl">
                  <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-professional border-0">
          <CardContent className="p-10">
            <h3 className="text-2xl font-bold mb-8 tracking-tight">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Button 
                variant="outline"
                className="flex flex-col items-center p-4 md:p-6 h-auto bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all border border-primary/20 hover:border-primary"
                onClick={() => openTransactionModal('income')}
                data-testid="add-income-button"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-3 rounded-lg bg-primary/10 hover:bg-primary-foreground/10 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Add Income</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center p-4 md:p-6 h-auto bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all border border-primary/20 hover:border-primary"
                onClick={() => openTransactionModal('expense')}
                data-testid="add-expense-button"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-3 rounded-lg bg-primary/10 hover:bg-primary-foreground/10 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Add Expense</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center p-4 md:p-6 h-auto bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all border border-primary/20 hover:border-primary"
                onClick={() => setGoalModal(true)}
                data-testid="set-goal-button"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-3 rounded-lg bg-primary/10 hover:bg-primary-foreground/10 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Create Goal</span>
              </Button>
              
              <Link href="/analytics">
                <Button 
                  variant="outline"
                  className="flex flex-col items-center p-4 md:p-6 h-auto bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all w-full border border-primary/20 hover:border-primary"
                  data-testid="view-reports-button"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-3 rounded-lg bg-primary/10 hover:bg-primary-foreground/10 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs md:text-sm font-medium">View Analytics</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-professional border-0">
            <CardContent className="p-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold tracking-tight">Recent Transactions</h3>
                <Link href="/transactions">
                  <Button variant="link" className="text-primary hover:text-primary/80 p-0 font-bold text-base" data-testid="view-all-transactions">
                    View all →
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4" data-testid="recent-transactions">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg font-semibold text-muted-foreground mb-2">No transactions yet</p>
                    <p className="text-sm text-muted-foreground mb-6">Start tracking your income and expenses</p>
                    <Button 
                      onClick={() => openTransactionModal('expense')}
                      className="btn-primary"
                    >
                      Add your first transaction
                    </Button>
                  </div>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/10 to-muted/5 hover:from-muted/20 hover:to-muted/10 transition-all duration-200 border border-border/30">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-accent/10' : 'bg-primary/10'
                        }`}>
                          <i className={`${getCategoryIcon(transaction.category, transaction.type as 'income' | 'expense')} ${getCategoryColor(transaction.category, transaction.type as 'income' | 'expense')} text-sm`}></i>
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description || transaction.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-accent' : 'text-destructive'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-professional border-0">
            <CardContent className="p-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold tracking-tight">Financial Goals</h3>
                <Link href="/goals">
                  <Button variant="link" className="text-primary hover:text-primary/80 p-0 font-bold text-base" data-testid="manage-goals">
                    Manage →
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-6" data-testid="goals-list">
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg font-semibold text-muted-foreground mb-2">No goals set yet</p>
                    <p className="text-sm text-muted-foreground mb-6">Create financial goals to track your progress</p>
                    <Button 
                      onClick={() => setGoalModal(true)}
                      className="btn-primary"
                    >
                      Create your first goal
                    </Button>
                  </div>
                ) : (
                  goals.slice(0, 3).map((goal) => {
                    const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
                    return (
                      <div key={goal.id} className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-muted/10 to-muted/5 border border-border/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <i className={`${goal.icon} text-primary text-lg`}></i>
                            <span className="font-semibold text-lg">{goal.name}</span>
                          </div>
                          <span className="text-base font-bold text-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 shadow-sm" 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-muted-foreground">
                          <span>{formatCurrency(goal.currentAmount)} saved</span>
                          <span>{formatCurrency(goal.targetAmount)} target</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      <Button 
        className="md:hidden fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-2xl z-40 btn-primary text-white hover:scale-110 transition-all duration-300"
        onClick={() => openTransactionModal('expense')}
        data-testid="mobile-add-transaction"
      >
        <svg className="w-8 h-8 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </Button>

      <TransactionModal 
        open={transactionModal.open} 
        onOpenChange={(open) => setTransactionModal(prev => ({ ...prev, open }))} 
        initialType={transactionModal.type}
      />
      
      <GoalModal 
        open={goalModal} 
        onOpenChange={setGoalModal} 
      />
    </div>
  );
}
