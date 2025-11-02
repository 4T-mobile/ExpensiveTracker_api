import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ERROR_MESSAGES } from '../common/constants/app.constants';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    const { startDate, endDate, periodType, amount } = createBudgetDto;

    const start = new Date(startDate);
    let end: Date;

    if (endDate) {
      end = new Date(endDate);
    } else {
      end = new Date(start);
      if (periodType === 'WEEKLY') {
        end.setDate(end.getDate() + 7);
      } else {
        end.setMonth(end.getMonth() + 1);
      }
      end.setDate(end.getDate() - 1);
    }

    if (end <= start) {
      throw new BadRequestException(ERROR_MESSAGES.BUDGET.INVALID_DATE_RANGE);
    }

    const overlappingBudget = await this.prisma.budget.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [
          {
            AND: [{ startDate: { lte: start } }, { endDate: { gte: start } }],
          },
          {
            AND: [{ startDate: { lte: end } }, { endDate: { gte: end } }],
          },
          {
            AND: [{ startDate: { gte: start } }, { endDate: { lte: end } }],
          },
        ],
      },
    });

    if (overlappingBudget) {
      throw new BadRequestException(ERROR_MESSAGES.BUDGET.OVERLAPPING_BUDGET);
    }

    return this.prisma.budget.create({
      data: {
        amount,
        periodType,
        userId,
        startDate: start,
        endDate: end,
      },
    });
  }

  async findAll(userId: string, isActive?: boolean) {
    const where: any = { userId };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.budget.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
  }

  async findCurrent(userId: string) {
    const now = new Date();

    const budget = await this.prisma.budget.findFirst({
      where: {
        userId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!budget) {
      return null;
    }

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
      },
    });

    const spentAmount = expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount.toString()),
      0,
    );

    const budgetAmount = parseFloat(budget.amount.toString());
    const remainingAmount = budgetAmount - spentAmount;
    const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (budget.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const isOverBudget = spentAmount > budgetAmount;

    return {
      ...budget,
      spentAmount,
      remainingAmount,
      percentage: Math.round(percentage * 100) / 100,
      daysRemaining,
      isOverBudget,
    };
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException(ERROR_MESSAGES.BUDGET.NOT_FOUND);
    }

    return budget;
  }

  async getStatus(id: string, userId: string) {
    const budget = await this.findOne(id, userId);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
      },
    });

    const spentAmount = expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount.toString()),
      0,
    );

    const budgetAmount = parseFloat(budget.amount.toString());
    const remainingAmount = budgetAmount - spentAmount;
    const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (budget.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const isOverBudget = spentAmount > budgetAmount;

    return {
      ...budget,
      spentAmount,
      remainingAmount,
      percentage: Math.round(percentage * 100) / 100,
      daysRemaining,
      isOverBudget,
    };
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException(ERROR_MESSAGES.BUDGET.NOT_FOUND);
    }

    if (budget.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this budget',
      );
    }

    const updateData: any = { ...updateBudgetDto };

    if (updateBudgetDto.startDate) {
      updateData.startDate = new Date(updateBudgetDto.startDate);
    }

    if (updateBudgetDto.endDate) {
      updateData.endDate = new Date(updateBudgetDto.endDate);
    }

    const start = updateData.startDate || budget.startDate;
    const end = updateData.endDate || budget.endDate;

    if (end <= start) {
      throw new BadRequestException(ERROR_MESSAGES.BUDGET.INVALID_DATE_RANGE);
    }

    return this.prisma.budget.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException(ERROR_MESSAGES.BUDGET.NOT_FOUND);
    }

    if (budget.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this budget',
      );
    }

    await this.prisma.budget.delete({
      where: { id },
    });

    return { message: 'Budget deleted successfully' };
  }
}
