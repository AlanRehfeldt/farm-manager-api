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
import { DeleteCropParamDto } from '../dtos/request/crop-request.dto';
import { DeleteCropResponseDto } from '../dtos/response/crop-response.dto';
import { DeleteCropService } from '../services/delete-crop.service';

const deleteCropParamSchema = z.object({ id: z.uuid() });

@ApiTags('Crop')
@FarmScoped()
@Controller('/crops')
export class DeleteCropController {
  constructor(private readonly deleteCropService: DeleteCropService) {}

  @ApiOperation({ summary: 'Delete crop' })
  @ApiOkResponse({
    description: 'Crop deleted successfully',
    type: DeleteCropResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Crop is referenced by crop seasons or varieties',
    type: ConflictDto,
  })
  @Delete(':id')
  async delete(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(deleteCropParamSchema))
    param: DeleteCropParamDto,
  ) {
    await this.deleteCropService.execute(param.id, organizationId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop deleted successfully',
      result: null,
    };
  }
}
