import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PeriodType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class CreateBudgetDto {
  @ApiProperty({
    example: 5000000,
    description: 'Budget amount in VND',
    minimum: 0,
  })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsNotEmpty({ message: 'Amount is required' })
  @Min(0, { message: 'Amount must be a positive number' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    enum: PeriodType,
    example: PeriodType.MONTHLY,
    description: 'Budget period type (WEEKLY or MONTHLY)',
  })
  @IsEnum(PeriodType, {
    message: 'Period type must be either WEEKLY or MONTHLY',
  })
  @IsNotEmpty({ message: 'Period type is required' })
  periodType: PeriodType;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Budget start date (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'Start date must be in YYYY-MM-DD format' })
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @ApiProperty({
    example: '2025-01-31',
    description: 'Budget end date (YYYY-MM-DD). If not provided, it will be auto-calculated based on periodType.',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be in YYYY-MM-DD format' })
  endDate?: string;
}
