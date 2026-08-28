import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetEmployeeParamDto } from '../dtos/request/get-employee.dto';
import { GetEmployeeResponseDto } from '../dtos/response/get-employee.dto';
import { GetEmployeeService } from '../services/get-employee.service';

const getEmployeeParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Employee')
@FarmScoped()
@Controller('/employees')
export class GetEmployeeController {
  constructor(private readonly getEmployeeService: GetEmployeeService) {}

  @ApiOperation({ summary: 'Get employee' })
  @ApiOkResponse({
    description: 'Employee retrieved successfully',
    type: GetEmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Employee does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(getEmployeeParamSchema))
    param: GetEmployeeParamDto,
  ) {
    const { employee } = await this.getEmployeeService.execute(
      param.id,
      organizationId,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Employee retrieved successfully',
      result: employee,
    };
  }
}
