import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { DeleteFieldParamDto } from '../dtos/request/field-request.dto';
import { DeleteFieldResponseDto } from '../dtos/response/field-response.dto';
import { DeleteFieldService } from '../services/delete-field.service';

const deleteFieldParamSchema = z.object({ id: z.uuid() });

@ApiTags('Field')
@FarmScoped()
@Controller('/fields')
export class DeleteFieldController {
  constructor(private readonly deleteFieldService: DeleteFieldService) {}

  @ApiOperation({ summary: 'Delete field' })
  @ApiOkResponse({
    description: 'Field deleted successfully',
    type: DeleteFieldResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Field does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Field is referenced by crop plantings',
    type: ConflictDto,
  })
  @Delete(':id')
  async delete(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(deleteFieldParamSchema))
    param: DeleteFieldParamDto,
  ) {
    await this.deleteFieldService.execute(param.id, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Field deleted successfully',
      result: null,
    };
  }
}
