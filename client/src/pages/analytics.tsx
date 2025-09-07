import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { getCategoryIcon, getCategoryColor } from "@/lib/categories";
import type { Transaction } from "@shared/schema";

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

export default function Analytics() {
  const { data: summary } = useQuery<AnalyticsSummary>({
    queryKey: ['/api/analytics/summary'],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: categories = [] } = useQuery<CategoryAnalytics[]>({
    queryKey: ['/api/analytics/categories'],
  });

  // Calculate analytics for the last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      name: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    };
  }).reverse();

  const monthlyData = last6Months.map(month => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() + 1 === month.month && 
             transactionDate.getFullYear() === month.year;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      ...month,
      income,
      expenses,
      balance: income - expenses
    };
  });

  const totalTransactions = transactions.length;
  const avgMonthlyIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length;
  const avgMonthlyExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length;

  return (
    <div className="min-h-screen">
      <header className="bg-card border-b border-border px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">Financial Analytics</h1>
            <p className="text-base text-muted-foreground mt-1">Gain insights into your spending patterns and trends</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold" data-testid="total-transactions">
                    {totalTransactions}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <i className="fas fa-exchange-alt text-primary text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Income</p>
                  <p className="text-2xl font-bold text-primary" data-testid="avg-income">
                    {formatCurrency(avgMonthlyIncome)}
                  </p>
                </div>
                <div className="bg-accent/10 p-3 rounded-full">
                  <i className="fas fa-arrow-up text-accent text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Expenses</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="avg-expenses">
                    {formatCurrency(avgMonthlyExpenses)}
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
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className={`text-2xl font-bold ${summary && summary.totalBalance >= 0 ? 'text-primary' : 'text-destructive'}`} data-testid="current-balance">
                    {summary ? formatCurrency(summary.totalBalance) : '₹0'}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <i className="fas fa-wallet text-primary text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6">6-Month Financial Trend</h3>
            <div className="space-y-4" data-testid="monthly-trend">
              {monthlyData.map((month, index) => {
                const maxAmount = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)));
                const incomeWidth = maxAmount > 0 ? (month.income / maxAmount) * 100 : 0;
                const expenseWidth = maxAmount > 0 ? (month.expenses / maxAmount) * 100 : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{month.name}</span>
                      <span className={`${month.balance >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        {formatCurrency(month.balance)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-primary font-medium w-12">Income</span>
                        <div className="flex-1 bg-accent/20 rounded-full h-3">
                          <div 
                            className="bg-primary h-3 rounded-full transition-all" 
                            style={{ width: `${incomeWidth}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {formatCurrency(month.income)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-chart-2 font-medium w-12">Expense</span>
                        <div className="flex-1 bg-chart-2/20 rounded-full h-3">
                          <div 
                            className="bg-chart-2 h-3 rounded-full transition-all" 
                            style={{ width: `${expenseWidth}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {formatCurrency(month.expenses)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6">Category Breakdown</h3>
            <div className="space-y-4" data-testid="category-breakdown">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No expense data available</p>
              ) : (
                categories.map((category, index) => {
                  const maxAmount = Math.max(...categories.map(c => c.amount));
                  const width = (category.amount / maxAmount) * 100;

                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3 w-48">
                        <i className={`${getCategoryIcon(category.category, 'expense')} ${getCategoryColor(category.category, 'expense')}`}></i>
                        <span className="font-medium capitalize text-sm">
                          {category.category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex items-center space-x-3">
                        <div className="flex-1 bg-chart-3/20 rounded-full h-4">
                          <div 
                            className="bg-chart-3 h-4 rounded-full transition-all" 
                            style={{ width: `${width}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold w-24 text-right">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Transaction Distribution</h3>
              <div className="space-y-4">
                {(() => {
                  const incomeTransactions = transactions.filter(t => t.type === 'income').length;
                  const expenseTransactions = transactions.filter(t => t.type === 'expense').length;
                  const total = incomeTransactions + expenseTransactions;
                  
                  if (total === 0) {
                    return <p className="text-sm text-muted-foreground text-center py-4">No transactions</p>;
                  }

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-accent rounded-full"></div>
                          <span className="text-sm">Income</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{incomeTransactions}</span>
                          <span className="text-xs text-muted-foreground">
                            ({Math.round((incomeTransactions / total) * 100)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-destructive rounded-full"></div>
                          <span className="text-sm">Expenses</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{expenseTransactions}</span>
                          <span className="text-xs text-muted-foreground">
                            ({Math.round((expenseTransactions / total) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Financial Summary</h3>
              <div className="space-y-4">
                {(() => {
                  const expenseAmounts = transactions
                    .filter(t => t.type === 'expense')
                    .map(t => parseFloat(t.amount));
                  
                  const largestExpense = expenseAmounts.length > 0 ? Math.max(...expenseAmounts) : 0;
                  const avgExpense = expenseAmounts.length > 0 
                    ? expenseAmounts.reduce((sum, amt) => sum + amt, 0) / expenseAmounts.length 
                    : 0;

                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Largest Expense</span>
                        <span className="text-sm font-medium">{formatCurrency(largestExpense)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Expense</span>
                        <span className="text-sm font-medium">{formatCurrency(avgExpense)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">This Month</span>
                        <span className="text-sm font-medium">
                          {summary ? formatCurrency(summary.monthlyExpenses) : '₹0'}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
