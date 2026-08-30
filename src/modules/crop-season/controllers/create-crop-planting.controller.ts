import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateCropPlantingBodyDto } from '../dtos/request/crop-season.dto';
import { CreateCropPlantingResponseDto } from '../dtos/response/crop-season-response.dto';
import { CreateCropPlantingService } from '../services/create-crop-planting.service';

const createCropPlantingBodySchema = z.object({
  cropSeasonId: z.uuid(),
  fieldId: z.uuid(),
  varietyId: z.uuid().optional().nullable(),
  plantedAreaHa: z.union([z.string(), z.number()]).optional().nullable(),
});

@ApiTags('CropPlanting')
@FarmScoped()
@Controller('/crop-plantings')
export class CreateCropPlantingController {
  constructor(
    private readonly createCropPlantingService: CreateCropPlantingService,
  ) {}

  @ApiOperation({ summary: 'Create crop planting' })
  @ApiCreatedResponse({
    description: 'Crop planting created successfully',
    type: CreateCropPlantingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Field already linked or crop season is closed',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description:
      'Not found: Crop season, field, or variety does not exist',
    type: NotFoundDto,
  })
  @Post()
  async create(
    @FarmId() farmId: string,
    @OrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createCropPlantingBodySchema))
    data: CreateCropPlantingBodyDto,
  ) {
    const { cropPlanting } = await this.createCropPlantingService.execute({
      ...data,
      farmId,
      organizationId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Crop planting created successfully',
      result: cropPlanting,
    };
  }
}
