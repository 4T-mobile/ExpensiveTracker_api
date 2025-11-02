import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({
    status: 201,
    description: 'Budget created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date range or overlapping budget',
  })
  create(
    @CurrentUser('sub') userId: string,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(userId, createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Budgets retrieved successfully',
  })
  findAll(
    @CurrentUser('sub') userId: string,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
  ) {
    return this.budgetsService.findAll(userId, isActive);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current active budget with spending status' })
  @ApiResponse({
    status: 200,
    description: 'Current budget retrieved successfully (returns null if no active budget)',
  })
  findCurrent(@CurrentUser('sub') userId: string) {
    return this.budgetsService.findCurrent(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a budget by ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  findOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.budgetsService.findOne(id, userId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get budget status with spending details' })
  @ApiResponse({
    status: 200,
    description: 'Budget status retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  getStatus(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.budgetsService.getStatus(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiResponse({
    status: 200,
    description: 'Budget updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not own this budget',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(id, userId, updateBudgetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiResponse({
    status: 200,
    description: 'Budget deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not own this budget',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.budgetsService.remove(id, userId);
  }
}
