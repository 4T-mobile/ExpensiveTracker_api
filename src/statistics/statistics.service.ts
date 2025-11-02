import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  DashboardStatistics,
  CategorySummary,
  PeriodSummary,
  CategoryBreakdown,
} from './interfaces/statistics.interface';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string): Promise<DashboardStatistics> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayExpenses,
      weekExpenses,
      monthExpenses,
      recentExpenses,
      currentBudget,
    ] = await Promise.all([
      this.prisma.expense.findMany({
        where: { userId, date: { gte: todayStart } },
      }),
      this.prisma.expense.findMany({
        where: { userId, date: { gte: weekStart } },
      }),
      this.prisma.expense.findMany({
        where: { userId, date: { gte: monthStart } },
        include: { category: true },
      }),
      this.prisma.expense.findMany({
        where: { userId },
        take: 5,
        orderBy: { date: 'desc' },
        include: { category: true },
      }),
      this.prisma.budget.findFirst({
        where: {
          userId,
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
    ]);

    const todayTotal = this.calculateTotal(todayExpenses);
    const weekTotal = this.calculateTotal(weekExpenses);
    const monthTotal = this.calculateTotal(monthExpenses);

    const categoryMap = new Map<string, CategorySummary>();
    for (const expense of monthExpenses) {
      const key = expense.categoryId;
      const existing = categoryMap.get(key);
      const amount = parseFloat(expense.amount.toString());

      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        categoryMap.set(key, {
          categoryId: expense.category.id,
          categoryName: expense.category.name,
          categoryIcon: expense.category.icon || '',
          categoryColor: expense.category.color || '',
          total: amount,
          count: 1,
          percentage: 0,
        });
      }
    }

    const topCategories = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((cat) => ({
        ...cat,
        percentage:
          monthTotal > 0
            ? Math.round((cat.total / monthTotal) * 100 * 100) / 100
            : 0,
      }));

    let budgetStatus: {
      budgetId: string;
      amount: number;
      spent: number;
      remaining: number;
      percentage: number;
      daysRemaining: number;
    } | null = null;
    if (currentBudget) {
      const budgetExpenses = await this.prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: currentBudget.startDate,
            lte: currentBudget.endDate,
          },
        },
      });

      const spent = this.calculateTotal(budgetExpenses);
      const budgetAmount = parseFloat(currentBudget.amount.toString());
      const remaining = budgetAmount - spent;
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (currentBudget.endDate.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      budgetStatus = {
        budgetId: currentBudget.id,
        amount: budgetAmount,
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        daysRemaining,
      };
    }

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const averageDailySpending = daysInMonth > 0 ? monthTotal / daysInMonth : 0;

    return {
      todayTotal,
      weekTotal,
      monthTotal,
      topCategories,
      recentExpenses,
      budgetStatus,
      averageDailySpending: Math.round(averageDailySpending * 100) / 100,
    };
  }

  async getDailyStatistics(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<PeriodSummary[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    const dailyMap = new Map<string, PeriodSummary>();

    for (const expense of expenses) {
      const dateKey = expense.date.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey);
      const amount = parseFloat(expense.amount.toString());

      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        dailyMap.set(dateKey, {
          date: dateKey,
          total: amount,
          count: 1,
        });
      }
    }

    return Array.from(dailyMap.values());
  }

  async getMonthlyStatistics(
    userId: string,
    months: number = 6,
  ): Promise<PeriodSummary[]> {
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - months + 1,
      1,
    );

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const monthlyMap = new Map<string, PeriodSummary>();

    for (const expense of expenses) {
      const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey);
      const amount = parseFloat(expense.amount.toString());

      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        monthlyMap.set(monthKey, {
          date: monthKey,
          total: amount,
          count: 1,
        });
      }
    }

    return Array.from(monthlyMap.values());
  }

  async getCategoryStatistics(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CategoryBreakdown[]> {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      include: { category: true },
    });

    const categoryMap = new Map<string, CategoryBreakdown>();
    let total = 0;

    for (const expense of expenses) {
      const key = expense.categoryId;
      const existing = categoryMap.get(key);
      const amount = parseFloat(expense.amount.toString());
      total += amount;

      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        categoryMap.set(key, {
          category: {
            id: expense.category.id,
            name: expense.category.name,
            icon: expense.category.icon || '',
            color: expense.category.color || '',
          },
          total: amount,
          count: 1,
          percentage: 0,
        });
      }
    }

    return Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage:
          total > 0 ? Math.round((cat.total / total) * 100 * 100) / 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  private calculateTotal(expenses: any[]): number {
    return expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount.toString()),
      0,
    );
  }
}
