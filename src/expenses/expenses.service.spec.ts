import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../database/prisma.service';

describe('ExpensesService', () => {
  let service: ExpensesService;

  const userId = 'user-id-123';
  const otherUserId = 'other-user-id';
  const categoryId = 'category-id-123';

  const mockCategory = {
    id: categoryId,
    name: 'Food',
    icon: '🍔',
    color: '#FF6B6B',
  };

  const mockExpense = {
    id: 'expense-id-123',
    name: 'Lunch',
    amount: 15.5,
    categoryId,
    userId,
    date: new Date('2024-01-15'),
    notes: 'Pizza',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategory,
  };

  const mockPrismaService = {
    expense: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createExpenseDto = {
      name: 'Lunch',
      amount: 15.5,
      categoryId,
      date: '2024-01-15',
      notes: 'Pizza',
    };

    it('should create expense successfully', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      mockPrismaService.expense.create.mockResolvedValue(mockExpense);

      const result = await service.create(userId, createExpenseDto);

      expect(result).toEqual(mockExpense);
      expect(mockPrismaService.expense.create).toHaveBeenCalledWith({
        data: {
          ...createExpenseDto,
          date: new Date(createExpenseDto.date),
          userId,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      });
    });

    it('should create expense with current date if date not provided', async () => {
      const dtoWithoutDate = {
        name: 'Lunch',
        amount: 15.5,
        categoryId,
      };

      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      mockPrismaService.expense.create.mockResolvedValue(mockExpense);

      await service.create(userId, dtoWithoutDate);

      expect(mockPrismaService.expense.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            date: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(service.create(userId, createExpenseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow using default categories', async () => {
      const defaultCategory = {
        ...mockCategory,
        userId: null,
        isDefault: true,
      };

      mockPrismaService.category.findFirst.mockResolvedValue(defaultCategory);
      mockPrismaService.expense.create.mockResolvedValue(mockExpense);

      await service.create(userId, createExpenseDto);

      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: {
          id: categoryId,
          OR: [{ userId }, { userId: null, isDefault: true }],
        },
      });
    });

    it('should not allow using categories from other users', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(service.create(userId, createExpenseDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated expenses', async () => {
      const expenses = [mockExpense];
      mockPrismaService.expense.findMany.mockResolvedValue(expenses);
      mockPrismaService.expense.count.mockResolvedValue(15);

      const result = await service.findAll(userId, { page: 1, limit: 10 });

      expect(result).toEqual({
        expenses,
        pagination: {
          total: 15,
          page: 1,
          limit: 10,
          totalPages: 2,
        },
      });
    });

    it('should apply date range filter', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);
      mockPrismaService.expense.count.mockResolvedValue(0);

      await service.findAll(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31'),
            },
          }),
        }),
      );
    });

    it('should apply category filter', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);
      mockPrismaService.expense.count.mockResolvedValue(0);

      await service.findAll(userId, { categoryId });

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId,
          }),
        }),
      );
    });

    it('should apply amount range filter', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);
      mockPrismaService.expense.count.mockResolvedValue(0);

      await service.findAll(userId, {
        minAmount: 10,
        maxAmount: 50,
      });

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            amount: {
              gte: 10,
              lte: 50,
            },
          }),
        }),
      );
    });

    it('should sort by date descending by default', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);
      mockPrismaService.expense.count.mockResolvedValue(0);

      await service.findAll(userId, {});

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { date: 'desc' },
        }),
      );
    });

    it('should allow sorting by amount', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);
      mockPrismaService.expense.count.mockResolvedValue(0);

      await service.findAll(userId, { sortBy: 'amount', order: 'asc' });

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { amount: 'asc' },
        }),
      );
    });

    it('should calculate correct pagination', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);
      mockPrismaService.expense.count.mockResolvedValue(25);

      const result = await service.findAll(userId, { page: 2, limit: 10 });

      expect(result.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should include category details in results', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([mockExpense]);
      mockPrismaService.expense.count.mockResolvedValue(1);

      await service.findAll(userId, {});

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
                color: true,
              },
            },
          },
        }),
      );
    });

    it('should apply skip and take for pagination', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);
      mockPrismaService.expense.count.mockResolvedValue(0);

      await service.findAll(userId, { page: 3, limit: 10 });

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return expense if it belongs to user', async () => {
      mockPrismaService.expense.findFirst.mockResolvedValue(mockExpense);

      const result = await service.findOne(mockExpense.id, userId);

      expect(result).toEqual(mockExpense);
    });

    it('should throw NotFoundException if expense not found', async () => {
      mockPrismaService.expense.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not return expenses belonging to other users', async () => {
      mockPrismaService.expense.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockExpense.id, otherUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should include category details', async () => {
      mockPrismaService.expense.findFirst.mockResolvedValue(mockExpense);

      await service.findOne(mockExpense.id, userId);

      expect(mockPrismaService.expense.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockExpense.id,
          userId,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      });
    });
  });

  describe('findRecent', () => {
    it('should return recent expenses with default limit', async () => {
      const expenses = [mockExpense];
      mockPrismaService.expense.findMany.mockResolvedValue(expenses);

      const result = await service.findRecent(userId);

      expect(result).toEqual(expenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: 5,
      });
    });

    it('should respect custom limit', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      await service.findRecent(userId, 10);

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });

    it('should cap limit at 20', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      await service.findRecent(userId, 50);

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        }),
      );
    });

    it('should order by date descending', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      await service.findRecent(userId);

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { date: 'desc' },
        }),
      );
    });
  });

  describe('update', () => {
    const updateExpenseDto = {
      name: 'Updated Lunch',
      amount: 20.0,
      notes: 'Updated notes',
    };

    it('should update expense successfully', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);
      mockPrismaService.expense.update.mockResolvedValue({
        ...mockExpense,
        ...updateExpenseDto,
      });

      const result = await service.update(
        mockExpense.id,
        userId,
        updateExpenseDto,
      );

      expect(result.name).toBe(updateExpenseDto.name);
      expect(result.amount).toBe(updateExpenseDto.amount);
    });

    it('should throw NotFoundException if expense does not exist', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', userId, updateExpenseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if expense belongs to other user', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue({
        ...mockExpense,
        userId: otherUserId,
      });

      await expect(
        service.update(mockExpense.id, userId, updateExpenseDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should validate new category if provided', async () => {
      const newCategoryId = 'new-category-id';
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);
      mockPrismaService.category.findFirst.mockResolvedValue({
        id: newCategoryId,
        name: 'New Category',
      });
      mockPrismaService.expense.update.mockResolvedValue(mockExpense);

      await service.update(mockExpense.id, userId, {
        categoryId: newCategoryId,
      });

      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: {
          id: newCategoryId,
          OR: [{ userId }, { userId: null, isDefault: true }],
        },
      });
    });

    it('should throw NotFoundException if new category is invalid', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);
      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(
        service.update(mockExpense.id, userId, {
          categoryId: 'invalid-category-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should convert date string to Date object', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);
      mockPrismaService.expense.update.mockResolvedValue(mockExpense);

      await service.update(mockExpense.id, userId, {
        date: '2024-02-01',
      });

      expect(mockPrismaService.expense.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            date: new Date('2024-02-01'),
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete expense successfully', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);
      mockPrismaService.expense.delete.mockResolvedValue(mockExpense);

      const result = await service.remove(mockExpense.id, userId);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Expense deleted successfully');
      expect(mockPrismaService.expense.delete).toHaveBeenCalledWith({
        where: { id: mockExpense.id },
      });
    });

    it('should throw NotFoundException if expense does not exist', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if expense belongs to other user', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue({
        ...mockExpense,
        userId: otherUserId,
      });

      await expect(service.remove(mockExpense.id, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
