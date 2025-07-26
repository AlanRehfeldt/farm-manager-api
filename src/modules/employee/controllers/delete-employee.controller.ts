import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { DeleteEmployeeService } from '../services/delete-employee.service';
import { DeleteEmployeeParamDto } from '../dtos/request/delete-employee.dto';
import { DeleteEmployeeResponseDto } from '../dtos/response/delete-employee.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const deleteEmployeeParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Employee')
@Controller('/employees')
export class DeleteEmployeeController {
  constructor(private readonly deleteEmployeeService: DeleteEmployeeService) {}

  @ApiOperation({ summary: 'Delete employee' })
  @ApiCreatedResponse({
    description: 'Employee deleted successfully',
    type: DeleteEmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Employee does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @Param(new ZodValidationPipe(deleteEmployeeParamSchema))
    param: DeleteEmployeeParamDto,
  ) {
    try {
      await this.deleteEmployeeService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Employee deleted successfully',
        result: null,
      };
    } catch (error) {
      console.error('Error deleting employee', error);
      throw error;
    }
  }
}
