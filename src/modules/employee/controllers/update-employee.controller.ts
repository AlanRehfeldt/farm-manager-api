import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import {
  UpdateEmployeeBodyDto,
  UpdateEmployeeParamDto,
} from '../dtos/request/update-employee.dto';
import { UpdateEmployeeResponseDto } from '../dtos/response/update-employee.dto';
import { UpdateEmployeeService } from '../services/update-employee.service';

import { SUPPORTED_EMPLOYEE_TYPES } from '../constants/employee-type';

const updateEmployeeParamSchema = z.object({
  id: z.uuid(),
});

const updateEmployeeSchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  registration: z
    .string()
    .min(3, { message: 'Registration must be at least 3 characters long.' })
    .max(20, { message: 'Registration must be at most 20 characters long.' })
    .optional(),
  type: z
    .enum(SUPPORTED_EMPLOYEE_TYPES, {
      message: 'Employee type is not supported in the agricultural MVP.',
    })
    .optional(),
});

@ApiTags('Employee')
@FarmScoped()
@FarmAdmin()
@Controller('/employees')
export class UpdateEmployeeController {
  constructor(private readonly updateEmployeeService: UpdateEmployeeService) {}

  @ApiOperation({ summary: 'Update employee' })
  @ApiOkResponse({
    description: 'Employee updated successfully',
    type: UpdateEmployeeResponseDto,
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
    description: 'Not found: Employee does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(updateEmployeeParamSchema))
    param: UpdateEmployeeParamDto,
    @Body(new ZodValidationPipe(updateEmployeeSchema))
    data: UpdateEmployeeBodyDto,
  ) {
    const { employee } = await this.updateEmployeeService.execute(
      organizationId,
      farmId,
      {
        id: param.id,
        ...data,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Employee updated successfully',
      result: employee,
    };
  }
}
