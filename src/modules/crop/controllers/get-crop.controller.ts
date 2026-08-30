import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetCropParamDto } from '../dtos/request/crop-request.dto';
import { GetCropResponseDto } from '../dtos/response/crop-response.dto';
import { GetCropService } from '../services/get-crop.service';

const getCropParamSchema = z.object({ id: z.uuid() });

@ApiTags('Crop')
@FarmScoped()
@Controller('/crops')
export class GetCropController {
  constructor(private readonly getCropService: GetCropService) {}

  @ApiOperation({ summary: 'Get crop by id' })
  @ApiOkResponse({
    description: 'Crop retrieved successfully',
    type: GetCropResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(getCropParamSchema)) param: GetCropParamDto,
  ) {
    const { crop } = await this.getCropService.execute(param.id, organizationId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop retrieved successfully',
      result: crop,
    };
  }
}
