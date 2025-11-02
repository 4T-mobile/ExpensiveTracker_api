import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @ApiProperty({
    example: 'Lunch at restaurant',
    description: 'Expense name/description',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Expense name is required' })
  @MaxLength(255, { message: 'Expense name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    example: 150000,
    description: 'Expense amount in VND',
    minimum: 0,
  })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsNotEmpty({ message: 'Amount is required' })
  @Min(0, { message: 'Amount must be a positive number' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Category ID',
  })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Expense date (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date must be in YYYY-MM-DD format' })
  date?: string;

  @ApiProperty({
    example: 'Had lunch with colleagues',
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
