export interface DashboardStatistics {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  topCategories: CategorySummary[];
  recentExpenses: any[];
  budgetStatus: BudgetStatusSummary | null;
  averageDailySpending: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  count: number;
  percentage: number;
}

export interface BudgetStatusSummary {
  budgetId: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  daysRemaining: number;
}

export interface PeriodSummary {
  date: string;
  total: number;
  count: number;
}

export interface CategoryBreakdown {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  total: number;
  count: number;
  percentage: number;
}
