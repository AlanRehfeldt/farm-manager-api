import { Body, Controller, HttpStatus, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { CreateEmployeeService } from '../services/create-employee.service';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { CreateEmployeeResponseDto } from '../dtos/response/create-employee.dto';
import { CreateEmployeeBodyDto } from '../dtos/request/create-employee.dto';

const createEmployeeBodySchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  registration: z
    .string()
    .min(3, { message: 'Registration must be at least 3 characters long.' })
    .max(20, { message: 'Registration must be at most 20 characters long.' }),
  type: z.enum([
    'FARM_MANAGER',
    'AGRONOMIST',
    'VETERINARIAN',
    'MACHINE_OPERATOR',
    'FIELD_WORKER',
    'LIVESTOCK_HANDLER',
    'IRRIGATION_TECHNICIAN',
    'ADMINISTRATIVE_ASSISTANT',
    'DRIVER',
    'SECURITY_GUARD',
    'TEMPORARY_WORKER',
    'OTHER',
  ]),
});

@ApiTags('Employee')
@Controller('/employees')
export class CreateEmployeeController {
  constructor(private readonly createEmployeeService: CreateEmployeeService) {}

  @ApiOperation({ summary: 'Create employee' })
  @ApiCreatedResponse({
    description: 'Employee created successfully',
    type: CreateEmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Registration already exists',
    type: ConflictDto,
  })
  @Post()
  @UsePipes(new ZodValidationPipe(createEmployeeBodySchema))
  async create(@Body() data: CreateEmployeeBodyDto) {
    try {
      const { employee } = await this.createEmployeeService.execute(data);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Employee created successfully',
        result: employee,
      };
    } catch (error) {
      console.error('Error creating employee', error);
      throw error;
    }
  }
}
