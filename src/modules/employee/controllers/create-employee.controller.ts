import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmAdmin } from 'src/common/tenancy/farm-admin.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { CreateEmployeeBodyDto } from '../dtos/request/create-employee.dto';
import { CreateEmployeeResponseDto } from '../dtos/response/create-employee.dto';
import { CreateEmployeeService } from '../services/create-employee.service';

import { SUPPORTED_EMPLOYEE_TYPES } from '../constants/employee-type';

const createEmployeeBodySchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  registration: z
    .string()
    .min(3, { message: 'Registration must be at least 3 characters long.' })
    .max(20, { message: 'Registration must be at most 20 characters long.' }),
  type: z.enum(SUPPORTED_EMPLOYEE_TYPES, {
    message: 'Employee type is not supported in the agricultural MVP.',
  }),
  farmId: z.uuid().nullable().optional(),
});

@ApiTags('Employee')
@FarmScoped()
@FarmAdmin()
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
  async create(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createEmployeeBodySchema))
    data: CreateEmployeeBodyDto,
  ) {
    const { employee } = await this.createEmployeeService.execute({
      ...data,
      organizationId,
      activeFarmId: farmId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Employee created successfully',
      result: employee,
    };
  }
}
