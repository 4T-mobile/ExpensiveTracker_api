import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-id-123',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    refreshToken: {
      deleteMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'security.bcryptRounds') return 10;
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const expectedProfile = {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedProfile);

      const result = await service.getProfile(mockUser.id);

      expect(result).toEqual(expectedProfile);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          username: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    const updateProfileDto = {
      username: 'newusername',
      email: 'newemail@example.com',
    };

    it('should update profile successfully', async () => {
      mockPrismaService.user.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const updatedUser = {
        ...mockUser,
        username: updateProfileDto.username,
        email: updateProfileDto.email,
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(mockUser.id, updateProfileDto);

      expect(result.username).toBe(updateProfileDto.username);
      expect(result.email).toBe(updateProfileDto.email);
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should update only username when email not provided', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const updatedUser = {
        ...mockUser,
        username: 'newusername',
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      await service.updateProfile(mockUser.id, { username: 'newusername' });

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should update only email when username not provided', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const updatedUser = {
        ...mockUser,
        email: 'newemail@example.com',
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      await service.updateProfile(mockUser.id, {
        email: 'newemail@example.com',
      });

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if username already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce({
        id: 'other-user-id',
        username: updateProfileDto.username,
      });

      await expect(
        service.updateProfile(mockUser.id, {
          username: updateProfileDto.username,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'other-user-id',
          email: updateProfileDto.email,
        });

      await expect(
        service.updateProfile(mockUser.id, updateProfileDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrismaService.user.update.mockRejectedValue(new Error());

      await expect(
        service.updateProfile('nonexistent-id', updateProfileDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not check username uniqueness if username not provided', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.updateProfile(mockUser.id, {
        email: 'newemail@example.com',
      });

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'newemail@example.com',
          NOT: { id: mockUser.id },
        },
      });
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
    };

    it('should change password successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.changePassword(
        mockUser.id,
        changePasswordDto,
      );

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Password changed successfully');
      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent-id', changePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if current password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUser.id, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should hash new password with correct bcrypt rounds', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 0 });

      await service.changePassword(mockUser.id, changePasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        changePasswordDto.newPassword,
        10,
      );
    });

    it('should invalidate all refresh tokens after password change', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 5 });

      await service.changePassword(mockUser.id, changePasswordDto);

      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });
  });

  describe('deleteAccount', () => {
    const password = 'correctPassword123';

    it('should delete account successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.deleteAccount(mockUser.id, password);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Account deleted successfully');
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteAccount('nonexistent-id', password),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.deleteAccount(mockUser.id, 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should verify password before deletion', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await service.deleteAccount(mockUser.id, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.passwordHash,
      );
    });
  });
});
