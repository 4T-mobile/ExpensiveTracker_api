import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({
    example: 'MyP@ssw0rd',
    description: 'Current password to confirm account deletion',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required to delete account' })
  password: string;
}
