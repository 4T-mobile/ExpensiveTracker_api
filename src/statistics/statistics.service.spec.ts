import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { PrismaService } from '../database/prisma.service';

describe('StatisticsService', () => {
  let service: StatisticsService;

  const userId = 'user-id-123';

  const mockExpense = {
    id: 'expense-id-123',
    name: 'Lunch',
    amount: 15.5,
    categoryId: 'category-id-123',
    userId,
    date: new Date('2024-01-15'),
    category: {
      id: 'category-id-123',
      name: 'Food',
      icon: '🍔',
      color: '#FF6B6B',
    },
  };

  const mockBudget = {
    id: 'budget-id-123',
    userId,
    amount: 500,
    periodType: 'MONTHLY' as const,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
  };

  const mockPrismaService = {
    expense: {
      findMany: jest.fn(),
    },
    budget: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return comprehensive dashboard statistics', async () => {
      mockPrismaService.expense.findMany
        .mockResolvedValueOnce([{ amount: 10 }])
        .mockResolvedValueOnce([{ amount: 50 }])
        .mockResolvedValueOnce([
          {
            ...mockExpense,
            amount: 200,
          },
        ])
        .mockResolvedValueOnce([mockExpense])
        .mockResolvedValueOnce([{ amount: 300 }]);

      mockPrismaService.budget.findFirst.mockResolvedValue(mockBudget);

      const result = await service.getDashboard(userId);

      expect(result).toHaveProperty('todayTotal');
      expect(result).toHaveProperty('weekTotal');
      expect(result).toHaveProperty('monthTotal');
      expect(result).toHaveProperty('topCategories');
      expect(result).toHaveProperty('recentExpenses');
      expect(result).toHaveProperty('budgetStatus');
      expect(result).toHaveProperty('averageDailySpending');
    });

    it('should calculate today total correctly', async () => {
      mockPrismaService.expense.findMany
        .mockResolvedValueOnce([{ amount: 10 }, { amount: 20 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      const result = await service.getDashboard(userId);

      expect(result.todayTotal).toBe(30);
    });

    it('should calculate week total correctly', async () => {
      mockPrismaService.expense.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ amount: 100 }, { amount: 50 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      const result = await service.getDashboard(userId);

      expect(result.weekTotal).toBe(150);
    });

    it('should calculate month total correctly', async () => {
      mockPrismaService.expense.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { ...mockExpense, amount: 100 },
          { ...mockExpense, amount: 200 },
          { ...mockExpense, amount: 50 },
        ])
        .mockResolvedValueOnce([]);

      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      const result = await service.getDashboard(userId);

      expect(result.monthTotal).toBe(350);
    });

    it('should return top 5 categories by spending', async () => {
      const cat1Expense = {
        ...mockExpense,
        categoryId: 'cat-1',
        amount: 100,
        category: {
          id: 'cat-1',
          name: 'Category 1',
          icon: '🔴',
          color: '#FF0000',
        },
      };
      const cat2Expense = {
        ...mockExpense,
        categoryId: 'cat-2',
        amount: 80,
        category: {
          id: 'cat-2',
          name: 'Category 2',
          icon: '🔵',
          color: '#0000FF',
        },
      };

      mockPrismaService.expense.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([cat1Expense, cat2Expense])
        .mockResolvedValueOnce([]);

      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      const result = await service.getDashboard(userId);

      expect(result.topCategories).toHaveLength(2);
      expect(result.topCategories[0].total).toBe(100);
      expect(result.topCategories[0].percentage).toBe(55.56);
    });

    it('should return null budgetStatus if no active budget', async () => {
      mockPrismaService.expense.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      const result = await service.getDashboard(userId);

      expect(result.budgetStatus).toBeNull();
    });

    it('should calculate average daily spending', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));

      mockPrismaService.expense.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ ...mockExpense, amount: 310 }])
        .mockResolvedValueOnce([]);

      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      const result = await service.getDashboard(userId);

      expect(result.averageDailySpending).toBe(10);

      jest.useRealTimers();
    });

    it('should handle empty expenses gracefully', async () => {
      mockPrismaService.expense.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      const result = await service.getDashboard(userId);

      expect(result.todayTotal).toBe(0);
      expect(result.weekTotal).toBe(0);
      expect(result.monthTotal).toBe(0);
      expect(result.topCategories).toEqual([]);
      expect(result.recentExpenses).toEqual([]);
      expect(result.averageDailySpending).toBe(0);
    });
  });

  describe('getDailyStatistics', () => {
    it('should return daily aggregates', async () => {
      mockPrismaService.expense.findMany.mockResolvedValueOnce([
        {
          date: new Date('2024-01-01'),
          amount: 20,
        },
        {
          date: new Date('2024-01-01'),
          amount: 30,
        },
        {
          date: new Date('2024-01-02'),
          amount: 75,
        },
      ]);

      const result = await service.getDailyStatistics(
        userId,
        '2024-01-01',
        '2024-01-31',
      );

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-01');
      expect(result[0].total).toBe(50);
      expect(result[0].count).toBe(2);
    });

    it('should format dates consistently', async () => {
      mockPrismaService.expense.findMany.mockResolvedValueOnce([
        {
          date: new Date('2024-01-05'),
          amount: 100,
        },
      ]);

      const result = await service.getDailyStatistics(
        userId,
        '2024-01-01',
        '2024-01-31',
      );

      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return empty array if no expenses in range', async () => {
      mockPrismaService.expense.findMany.mockResolvedValueOnce([]);

      const result = await service.getDailyStatistics(
        userId,
        '2024-01-01',
        '2024-01-31',
      );

      expect(result).toEqual([]);
    });

    it('should query with correct date range', async () => {
      mockPrismaService.expense.findMany.mockResolvedValueOnce([]);

      await service.getDailyStatistics(userId, '2024-01-01', '2024-01-31');

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          },
        },
        orderBy: { date: 'asc' },
      });
    });
  });

  describe('getMonthlyStatistics', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return monthly aggregates for last N months', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([
        {
          date: new Date('2024-05-10'),
          amount: 100,
        },
        {
          date: new Date('2024-06-01'),
          amount: 200,
        },
      ]);

      const result = await service.getMonthlyStatistics(userId, 6);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should format month as YYYY-MM', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([
        {
          date: new Date('2024-01-15'),
          amount: 100,
        },
      ]);

      const result = await service.getMonthlyStatistics(userId, 6);

      if (result.length > 0) {
        expect(result[0].date).toMatch(/^\d{4}-\d{2}$/);
      }
    });

    it('should use default 6 months if not specified', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      await service.getMonthlyStatistics(userId);

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: expect.any(Date),
            },
          }),
        }),
      );
    });

    it('should handle empty results', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.getMonthlyStatistics(userId, 6);

      expect(result).toEqual([]);
    });
  });

  describe('getCategoryStatistics', () => {
    it('should return category breakdown with percentages', async () => {
      const mockExpenses = [
        {
          categoryId: 'cat-1',
          amount: 100,
          category: {
            id: 'cat-1',
            name: 'Food',
            icon: '🍔',
            color: '#FF6B6B',
          },
        },
        {
          categoryId: 'cat-2',
          amount: 50,
          category: {
            id: 'cat-2',
            name: 'Transport',
            icon: '🚗',
            color: '#4ECDC4',
          },
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.getCategoryStatistics(userId);

      expect(result).toHaveLength(2);
      expect(result[0].total).toBe(100);
      expect(result[0].percentage).toBe(66.67);
      expect(result[1].total).toBe(50);
      expect(result[1].percentage).toBe(33.33);
    });

    it('should apply date range filter when provided', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      await service.getCategoryStatistics(userId, '2024-01-01', '2024-01-31');

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          },
        },
        include: { category: true },
      });
    });

    it('should sort categories by total descending', async () => {
      const mockExpenses = [
        {
          categoryId: 'cat-1',
          amount: 50,
          category: { id: 'cat-1', name: 'A', icon: '', color: '' },
        },
        {
          categoryId: 'cat-2',
          amount: 100,
          category: { id: 'cat-2', name: 'B', icon: '', color: '' },
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.getCategoryStatistics(userId);

      expect(result[0].total).toBeGreaterThan(result[1].total);
    });

    it('should aggregate multiple expenses for same category', async () => {
      const mockExpenses = [
        {
          categoryId: 'cat-1',
          amount: 50,
          category: { id: 'cat-1', name: 'Food', icon: '', color: '' },
        },
        {
          categoryId: 'cat-1',
          amount: 30,
          category: { id: 'cat-1', name: 'Food', icon: '', color: '' },
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.getCategoryStatistics(userId);

      expect(result).toHaveLength(1);
      expect(result[0].total).toBe(80);
      expect(result[0].count).toBe(2);
    });

    it('should handle zero total correctly', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.getCategoryStatistics(userId);

      expect(result).toEqual([]);
    });

    it('should include category details', async () => {
      const mockExpenses = [
        {
          categoryId: 'cat-1',
          amount: 100,
          category: {
            id: 'cat-1',
            name: 'Food',
            icon: '🍔',
            color: '#FF6B6B',
          },
        },
      ];

      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      const result = await service.getCategoryStatistics(userId);

      expect(result[0].category).toEqual({
        id: 'cat-1',
        name: 'Food',
        icon: '🍔',
        color: '#FF6B6B',
      });
    });
  });
});
