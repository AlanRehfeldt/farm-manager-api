import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
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
import { DeleteEmployeeParamDto } from '../dtos/request/delete-employee.dto';
import { DeleteEmployeeResponseDto } from '../dtos/response/delete-employee.dto';
import { DeleteEmployeeService } from '../services/delete-employee.service';

const deleteEmployeeParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Employee')
@FarmScoped()
@Controller('/employees')
export class DeleteEmployeeController {
  constructor(private readonly deleteEmployeeService: DeleteEmployeeService) {}

  @ApiOperation({ summary: 'Delete employee' })
  @ApiOkResponse({
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
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(deleteEmployeeParamSchema))
    param: DeleteEmployeeParamDto,
  ) {
    await this.deleteEmployeeService.execute(param.id, organizationId, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Employee deleted successfully',
      result: null,
    };
  }
}
