import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Personal Care',
    description: 'Category name',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  @MaxLength(50, { message: 'Category name must not exceed 50 characters' })
  name: string;

  @ApiProperty({
    example: '💅',
    description: 'Category icon (emoji)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    example: '#FF6B6B',
    description: 'Category color (hex code)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Color must be a valid hex code (e.g., #FF6B6B)',
  })
  color?: string;
}
