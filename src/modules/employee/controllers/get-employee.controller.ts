import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { GetEmployeeService } from '../services/get-employee.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetEmployeeParamDto } from '../dtos/request/get-employee.dto';
import { GetEmployeeResponseDto } from '../dtos/response/get-employee.dto';

const getEmployeeParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Employee')
@Controller('/employees')
export class GetEmployeeController {
  constructor(private readonly getEmployeeService: GetEmployeeService) {}

  @ApiOperation({ summary: 'Get employee' })
  @ApiOkResponse({
    description: 'Employee retrived successfully',
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
    @Param(new ZodValidationPipe(getEmployeeParamSchema))
    param: GetEmployeeParamDto,
  ) {
    try {
      const { employee } = await this.getEmployeeService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Employee retrived successfully',
        employee,
      };
    } catch (error) {
      console.error('Error getting employee', error);
      throw error;
    }
  }
}
