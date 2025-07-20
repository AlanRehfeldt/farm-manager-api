import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { UpdateEmployeeService } from '../services/update-employee.service';
import { UpdateEmployeeResponseDto } from '../dtos/response/update-employee.dto';
import {
  UpdateEmployeeBodyDto,
  UpdateEmployeeParamDto,
} from '../dtos/request/update-employee.dto';

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
    .enum([
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
    ])
    .optional(),
});

@ApiTags('Employee')
@Controller('/employees')
export class UpdateEmployeeController {
  constructor(private readonly updateEmployeeService: UpdateEmployeeService) {}

  @ApiOperation({ summary: 'Update employee' })
  @ApiCreatedResponse({
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
  @Put(':id')
  async update(
    @Param(new ZodValidationPipe(updateEmployeeParamSchema))
    param: UpdateEmployeeParamDto,
    @Body(new ZodValidationPipe(updateEmployeeSchema))
    data: UpdateEmployeeBodyDto,
  ) {
    try {
      const { employee } = await this.updateEmployeeService.execute({
        id: param.id,
        ...data,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Employee updated successfully',
        employee,
      };
    } catch (error) {
      console.error('Error updating employee', error);
      throw error;
    }
  }
}
