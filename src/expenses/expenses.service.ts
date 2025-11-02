import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import {
  ERROR_MESSAGES,
  APP_CONSTANTS,
} from '../common/constants/app.constants';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto) {
    const { categoryId, date, ...rest } = createExpenseDto;

    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId }, { userId: null, isDefault: true }],
      },
    });

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    }

    const expenseDate = date ? new Date(date) : new Date();

    return this.prisma.expense.create({
      data: {
        ...rest,
        userId,
        categoryId,
        date: expenseDate,
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
  }

  async findAll(userId: string, query: QueryExpenseDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      order = 'desc',
      categoryId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, APP_CONSTANTS.PAGINATION.MAX_LIMIT);

    const where: any = { userId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount.lte = maxAmount;
      }
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
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
      this.prisma.expense.count({ where }),
    ]);

    return {
      expenses,
      pagination: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
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

    if (!expense) {
      throw new NotFoundException(ERROR_MESSAGES.EXPENSE.NOT_FOUND);
    }

    return expense;
  }

  async findRecent(userId: string, limit: number = 5) {
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
      take: Math.min(limit, 20),
      orderBy: { date: 'desc' },
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

    return expenses;
  }

  async update(id: string, userId: string, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(ERROR_MESSAGES.EXPENSE.NOT_FOUND);
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this expense',
      );
    }

    if (updateExpenseDto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateExpenseDto.categoryId,
          OR: [{ userId }, { userId: null, isDefault: true }],
        },
      });

      if (!category) {
        throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
      }
    }

    const updateData: any = { ...updateExpenseDto };
    if (updateExpenseDto.date) {
      updateData.date = new Date(updateExpenseDto.date);
    }

    return this.prisma.expense.update({
      where: { id },
      data: updateData,
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
  }

  async remove(id: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(ERROR_MESSAGES.EXPENSE.NOT_FOUND);
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this expense',
      );
    }

    await this.prisma.expense.delete({
      where: { id },
    });

    return { message: 'Expense deleted successfully' };
  }
}
