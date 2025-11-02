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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  create(
    @CurrentUser('sub') userId: string,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(userId, createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Expenses retrieved successfully',
  })
  findAll(@CurrentUser('sub') userId: string, @Query() query: QueryExpenseDto) {
    return this.expensesService.findAll(userId, query);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent expenses' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Recent expenses retrieved successfully',
  })
  findRecent(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.expensesService.findRecent(userId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiResponse({
    status: 200,
    description: 'Expense retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  findOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.expensesService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not own this expense',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, userId, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({
    status: 200,
    description: 'Expense deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not own this expense',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.expensesService.remove(id, userId);
  }
}
