import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../database/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const userId = 'user-id-123';
  const otherUserId = 'other-user-id';

  const mockCategory = {
    id: 'category-id-123',
    name: 'Food',
    icon: '🍔',
    color: '#FF6B6B',
    userId,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDefaultCategory = {
    id: 'default-category-id',
    name: 'Transportation',
    icon: '🚗',
    color: '#4ECDC4',
    userId: null,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    category: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCategoryDto = {
      name: 'Food',
      icon: '🍔',
      color: '#FF6B6B',
    };

    it('should create category successfully', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(userId, createCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          ...createCategoryDto,
          userId,
          isDefault: false,
        },
      });
    });

    it('should throw ConflictException if category name already exists for user', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      await expect(service.create(userId, createCategoryDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if category name matches default category', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(
        mockDefaultCategory,
      );

      await expect(service.create(userId, createCategoryDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should check for duplicate names across user and default categories', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      await service.create(userId, createCategoryDto);

      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: {
          name: createCategoryDto.name,
          OR: [{ userId }, { userId: null }],
        },
      });
    });

    it('should always set isDefault to false for user-created categories', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      await service.create(userId, createCategoryDto);

      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isDefault: false,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return both user and default categories', async () => {
      const categories = [mockCategory, mockDefaultCategory];
      mockPrismaService.category.findMany.mockResolvedValue(categories);

      const result = await service.findAll(userId);

      expect(result).toEqual(categories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId }, { userId: null, isDefault: true }],
        },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      });
    });

    it('should return empty array if no categories exist', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
    });

    it('should order categories with defaults first, then by name', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      await service.findAll(userId);

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        }),
      );
    });

    it('should only return user-specific and default categories', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      await service.findAll(userId);

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ userId }, { userId: null, isDefault: true }],
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return category if it belongs to user', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      const result = await service.findOne(mockCategory.id, userId);

      expect(result).toEqual(mockCategory);
    });

    it('should return category if it is a default category', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(
        mockDefaultCategory,
      );

      const result = await service.findOne(mockDefaultCategory.id, userId);

      expect(result).toEqual(mockDefaultCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not return categories belonging to other users', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockCategory.id, otherUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should query with correct access control', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      await service.findOne(mockCategory.id, userId);

      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockCategory.id,
          OR: [{ userId }, { userId: null, isDefault: true }],
        },
      });
    });
  });

  describe('update', () => {
    const updateCategoryDto = {
      name: 'Updated Food',
      icon: '🍕',
      color: '#00FF00',
    };

    it('should update category successfully', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.update.mockResolvedValue({
        ...mockCategory,
        ...updateCategoryDto,
      });

      const result = await service.update(
        mockCategory.id,
        userId,
        updateCategoryDto,
      );

      expect(result.name).toBe(updateCategoryDto.name);
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
        data: updateCategoryDto,
      });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', userId, updateCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if trying to update default category', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(
        mockDefaultCategory,
      );

      await expect(
        service.update(mockDefaultCategory.id, userId, updateCategoryDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if category belongs to other user', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        userId: otherUserId,
      });

      await expect(
        service.update(mockCategory.id, userId, updateCategoryDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if new name already exists', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.findFirst.mockResolvedValue({
        id: 'other-category-id',
        name: updateCategoryDto.name,
        userId,
      });

      await expect(
        service.update(mockCategory.id, userId, updateCategoryDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should not check name uniqueness if name not provided in update', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue(mockCategory);

      await service.update(mockCategory.id, userId, {
        icon: '🍕',
        color: '#00FF00',
      });

      expect(mockPrismaService.category.findFirst).not.toHaveBeenCalled();
    });

    it('should allow updating icon and color without name', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue({
        ...mockCategory,
        icon: '🍕',
        color: '#00FF00',
      });

      const result = await service.update(mockCategory.id, userId, {
        icon: '🍕',
        color: '#00FF00',
      });

      expect(result.icon).toBe('🍕');
      expect(result.color).toBe('#00FF00');
    });
  });

  describe('remove', () => {
    it('should delete category successfully', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        _count: { expenses: 0 },
      });
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(mockCategory.id, userId);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Category deleted successfully');
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
      });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if trying to delete default category', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockDefaultCategory,
        _count: { expenses: 0 },
      });

      await expect(
        service.remove(mockDefaultCategory.id, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if category belongs to other user', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        userId: otherUserId,
        _count: { expenses: 0 },
      });

      await expect(service.remove(mockCategory.id, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException if category has associated expenses', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        _count: { expenses: 5 },
      });

      await expect(service.remove(mockCategory.id, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should include expense count when checking category', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        _count: { expenses: 0 },
      });
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      await service.remove(mockCategory.id, userId);

      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
        include: {
          _count: {
            select: { expenses: true },
          },
        },
      });
    });

    it('should not delete category if it has even one expense', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        _count: { expenses: 1 },
      });

      await expect(service.remove(mockCategory.id, userId)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.category.delete).not.toHaveBeenCalled();
    });
  });
});
