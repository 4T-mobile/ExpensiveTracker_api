import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { PrismaService } from '../database/prisma.service';

describe('BudgetsService', () => {
  let service: BudgetsService;

  const userId = 'user-id-123';
  const otherUserId = 'other-user-id';

  const mockBudget = {
    id: 'budget-id-123',
    userId,
    amount: 500,
    periodType: 'MONTHLY' as const,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    budget: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    expense: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createBudgetDto = {
      amount: 500,
      periodType: 'MONTHLY' as const,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    it('should create budget successfully', async () => {
      mockPrismaService.budget.findMany.mockResolvedValue([]);
      mockPrismaService.budget.create.mockResolvedValue(mockBudget);

      const result = await service.create(userId, createBudgetDto);

      expect(result).toEqual(mockBudget);
      expect(mockPrismaService.budget.create).toHaveBeenCalledWith({
        data: {
          ...createBudgetDto,
          startDate: new Date(createBudgetDto.startDate),
          endDate: new Date(createBudgetDto.endDate),
          userId,
        },
      });
    });

    it('should throw BadRequestException if endDate is before startDate', async () => {
      const invalidDto = {
        ...createBudgetDto,
        startDate: '2024-01-31',
        endDate: '2024-01-01',
      };

      await expect(service.create(userId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if endDate equals startDate', async () => {
      const invalidDto = {
        ...createBudgetDto,
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      };

      await expect(service.create(userId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should detect overlapping budget - new start falls within existing', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue({
        ...mockBudget,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      const overlappingDto = {
        ...createBudgetDto,
        startDate: '2024-01-15',
        endDate: '2024-02-15',
      };

      await expect(service.create(userId, overlappingDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should detect overlapping budget - new end falls within existing', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue({
        ...mockBudget,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
      });

      const overlappingDto = {
        ...createBudgetDto,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await expect(service.create(userId, overlappingDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should detect overlapping budget - new budget contains existing', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue({
        ...mockBudget,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
      });

      const overlappingDto = {
        ...createBudgetDto,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await expect(service.create(userId, overlappingDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow consecutive budgets without overlap', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(null);
      mockPrismaService.budget.create.mockResolvedValue({
        ...mockBudget,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-28'),
      });

      const consecutiveDto = {
        ...createBudgetDto,
        startDate: '2024-02-01',
        endDate: '2024-02-28',
      };

      await expect(
        service.create(userId, consecutiveDto),
      ).resolves.toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all budgets for user', async () => {
      mockPrismaService.budget.findMany.mockResolvedValue([mockBudget]);

      const result = await service.findAll(userId);

      expect(result).toEqual([mockBudget]);
      expect(mockPrismaService.budget.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { startDate: 'desc' },
      });
    });

    it('should filter by active status when provided', async () => {
      mockPrismaService.budget.findMany.mockResolvedValue([]);

      await service.findAll(userId, true);

      expect(mockPrismaService.budget.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isActive: true,
        },
        orderBy: { startDate: 'desc' },
      });
    });

    it('should return empty array if no budgets exist', async () => {
      mockPrismaService.budget.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findCurrent', () => {
    it('should return current budget with spending calculations', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(mockBudget);
      mockPrismaService.expense.findMany.mockResolvedValue([
        { amount: 100 },
        { amount: 200 },
      ]);

      const result = await service.findCurrent(userId);

      expect(result).toEqual({
        budget: mockBudget,
        spent: 300,
        remaining: 200,
        percentage: 60,
      });
    });

    it('should throw NotFoundException if no current budget exists', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      await expect(service.findCurrent(userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle budget with no expenses', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(mockBudget);
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.findCurrent(userId);

      expect(result.spent).toBe(0);
      expect(result.remaining).toBe(500);
      expect(result.percentage).toBe(0);
    });

    it('should calculate percentage correctly', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(mockBudget);
      mockPrismaService.expense.findMany.mockResolvedValue([{ amount: 250 }]);

      const result = await service.findCurrent(userId);

      expect(result.percentage).toBe(50);
    });

    it('should handle percentage over 100%', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(mockBudget);
      mockPrismaService.expense.findMany.mockResolvedValue([{ amount: 600 }]);

      const result = await service.findCurrent(userId);

      expect(result.percentage).toBe(120);
      expect(result.remaining).toBe(-100);
    });

    it('should handle zero budget amount', async () => {
      const zeroBudget = { ...mockBudget, amount: 0 };
      mockPrismaService.budget.findFirst.mockResolvedValue(zeroBudget);
      mockPrismaService.expense.findMany.mockResolvedValue([{ amount: 100 }]);

      const result = await service.findCurrent(userId);

      expect(result.percentage).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return budget if it belongs to user', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(mockBudget);

      const result = await service.findOne(mockBudget.id, userId);

      expect(result).toEqual(mockBudget);
    });

    it('should throw NotFoundException if budget not found', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not return budget if it belongs to other user', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(null);

      await expect(service.findOne(mockBudget.id, otherUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatus', () => {
    it('should return comprehensive budget status', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(mockBudget);
      mockPrismaService.expense.findMany.mockResolvedValue([
        { amount: 100 },
        { amount: 200 },
      ]);

      const result = await service.getStatus(mockBudget.id, userId);

      expect(result).toHaveProperty('budget');
      expect(result).toHaveProperty('spent');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('percentage');
      expect(result).toHaveProperty('totalDays');
      expect(result).toHaveProperty('daysRemaining');
    });

    it('should calculate days remaining correctly', async () => {
      const futureEndDate = new Date();
      futureEndDate.setDate(futureEndDate.getDate() + 10);

      mockPrismaService.budget.findFirst.mockResolvedValue({
        ...mockBudget,
        endDate: futureEndDate,
      });
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.getStatus(mockBudget.id, userId);

      expect(result.daysRemaining).toBeGreaterThanOrEqual(0);
    });

    it('should cap days remaining at 0 for past budgets', async () => {
      const pastBudget = {
        ...mockBudget,
        endDate: new Date('2023-12-31'),
      };

      mockPrismaService.budget.findFirst.mockResolvedValue(pastBudget);
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.getStatus(mockBudget.id, userId);

      expect(result.daysRemaining).toBe(0);
    });
  });

  describe('update', () => {
    const updateBudgetDto = {
      amount: 600,
    };

    it('should update budget successfully', async () => {
      mockPrismaService.budget.findUnique.mockResolvedValue(mockBudget);
      mockPrismaService.budget.update.mockResolvedValue({
        ...mockBudget,
        amount: 600,
      });

      const result = await service.update(
        mockBudget.id,
        userId,
        updateBudgetDto,
      );

      expect(result.amount).toBe(600);
    });

    it('should throw NotFoundException if budget not found', async () => {
      mockPrismaService.budget.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', userId, updateBudgetDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if budget belongs to other user', async () => {
      mockPrismaService.budget.findUnique.mockResolvedValue({
        ...mockBudget,
        userId: otherUserId,
      });

      await expect(
        service.update(mockBudget.id, userId, updateBudgetDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should validate date range when updating dates', async () => {
      mockPrismaService.budget.findUnique.mockResolvedValue(mockBudget);

      await expect(
        service.update(mockBudget.id, userId, {
          startDate: '2024-01-31',
          endDate: '2024-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use existing dates if not provided in update', async () => {
      mockPrismaService.budget.findUnique.mockResolvedValue(mockBudget);
      mockPrismaService.budget.update.mockResolvedValue(mockBudget);

      await service.update(mockBudget.id, userId, { amount: 600 });

      expect(mockPrismaService.budget.update).toHaveBeenCalledWith({
        where: { id: mockBudget.id },
        data: {
          amount: 600,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete budget successfully', async () => {
      mockPrismaService.budget.findUnique.mockResolvedValue(mockBudget);
      mockPrismaService.budget.delete.mockResolvedValue(mockBudget);

      const result = await service.remove(mockBudget.id, userId);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Budget deleted successfully');
    });

    it('should throw NotFoundException if budget not found', async () => {
      mockPrismaService.budget.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if budget belongs to other user', async () => {
      mockPrismaService.budget.findUnique.mockResolvedValue({
        ...mockBudget,
        userId: otherUserId,
      });

      await expect(service.remove(mockBudget.id, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
