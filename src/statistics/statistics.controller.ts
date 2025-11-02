import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  getDashboard(@CurrentUser('sub') userId: string) {
    return this.statisticsService.getDashboard(userId);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily statistics for a date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Daily statistics retrieved successfully',
  })
  getDailyStatistics(
    @CurrentUser('sub') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statisticsService.getDailyStatistics(
      userId,
      startDate,
      endDate,
    );
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly statistics' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Monthly statistics retrieved successfully',
  })
  getMonthlyStatistics(
    @CurrentUser('sub') userId: string,
    @Query('months') months?: number,
  ) {
    return this.statisticsService.getMonthlyStatistics(userId, months);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Get statistics by category' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Category statistics retrieved successfully',
  })
  getCategoryStatistics(
    @CurrentUser('sub') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statisticsService.getCategoryStatistics(
      userId,
      startDate,
      endDate,
    );
  }
}
