import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { DeleteVarietyParamDto } from '../dtos/request/variety-request.dto';
import { DeleteVarietyResponseDto } from '../dtos/response/variety-response.dto';
import { DeleteVarietyService } from '../services/delete-variety.service';

const deleteVarietyParamSchema = z.object({ id: z.uuid() });

@ApiTags('Variety')
@FarmScoped()
@Controller('/varieties')
export class DeleteVarietyController {
  constructor(private readonly deleteVarietyService: DeleteVarietyService) {}

  @ApiOperation({ summary: 'Delete variety' })
  @ApiOkResponse({
    description: 'Variety deleted successfully',
    type: DeleteVarietyResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Variety does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Variety is referenced by crop plantings',
    type: ConflictDto,
  })
  @Delete(':id')
  async delete(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(deleteVarietyParamSchema))
    param: DeleteVarietyParamDto,
  ) {
    await this.deleteVarietyService.execute(param.id, organizationId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Variety deleted successfully',
      result: null,
    };
  }
}
