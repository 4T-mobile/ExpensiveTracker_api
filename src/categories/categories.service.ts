import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ERROR_MESSAGES } from '../common/constants/app.constants';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: createCategoryDto.name,
        OR: [{ userId }, { userId: null }],
      },
    });

    if (existingCategory) {
      throw new ConflictException(ERROR_MESSAGES.CATEGORY.DUPLICATE_NAME);
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
        isDefault: false,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null, isDefault: true }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        OR: [{ userId }, { userId: null, isDefault: true }],
      },
    });

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    }

    return category;
  }

  async update(
    id: string,
    userId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    }

    if (category.isDefault || category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this category',
      );
    }

    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          userId,
          NOT: { id },
        },
      });

      if (existingCategory) {
        throw new ConflictException(ERROR_MESSAGES.CATEGORY.DUPLICATE_NAME);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    }

    if (category.isDefault) {
      throw new ForbiddenException(
        ERROR_MESSAGES.CATEGORY.DEFAULT_CATEGORY_DELETE,
      );
    }

    if (category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this category',
      );
    }

    if (category._count.expenses > 0) {
      throw new ConflictException(ERROR_MESSAGES.CATEGORY.DELETE_FAILED);
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}
