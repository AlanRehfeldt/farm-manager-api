import { Body, Controller, HttpStatus, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { CreateCostCenterService } from '../services/create-cost-center.service';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { CreateCostCenterResponseDto } from '../dtos/response/create-cost-center.dto';
import { CreateCostCenterBodyDto } from '../dtos/request/create-cost-center.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const createCostCenterBodySchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  description: z
    .string()
    .min(3, { message: 'Registration must be at least 3 characters long.' })
    .max(250, { message: 'Registration must be at most 250 characters long.' }),
  code: z
    .string()
    .min(1, { message: 'Code must be at least 1 character long.' }),
  parentId: z.uuid().optional(),
});

@ApiTags('CostCenter')
@Controller('/cost-centers')
export class CreateCostCenterController {
  constructor(
    private readonly createCostCenterService: CreateCostCenterService,
  ) {}

  @ApiOperation({ summary: 'Create cost center' })
  @ApiCreatedResponse({
    description: 'Cost center created successfully',
    type: CreateCostCenterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Registration already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: ParentId does not exist',
    type: NotFoundDto,
  })
  @Post()
  @UsePipes(new ZodValidationPipe(createCostCenterBodySchema))
  async create(@Body() data: CreateCostCenterBodyDto) {
    try {
      const { costCenter } = await this.createCostCenterService.execute(data);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Cost center created successfully',
        result: costCenter,
      };
    } catch (error) {
      console.error('Error creating cost center', error);
      throw error;
    }
  }
}
