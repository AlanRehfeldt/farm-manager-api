import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateCropSeasonBodyDto } from '../dtos/request/crop-season.dto';
import { CreateCropSeasonResponseDto } from '../dtos/response/crop-season-response.dto';
import { CreateCropSeasonService } from '../services/create-crop-season.service';

const createCropSeasonBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  cropId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  productionUomId: z.uuid(),
  referenceSalePriceInCents: z.number().int().min(0).optional().nullable(),
});

@ApiTags('CropSeason')
@FarmScoped()
@Controller('/crop-seasons')
export class CreateCropSeasonController {
  constructor(
    private readonly createCropSeasonService: CreateCropSeasonService,
  ) {}

  @ApiOperation({ summary: 'Create crop season' })
  @ApiCreatedResponse({
    description: 'Crop season created successfully',
    type: CreateCropSeasonResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop or unit of measurement does not exist',
    type: NotFoundDto,
  })
  @Post()
  async create(
    @FarmId() farmId: string,
    @OrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createCropSeasonBodySchema))
    data: CreateCropSeasonBodyDto,
  ) {
    const { cropSeason } = await this.createCropSeasonService.execute({
      ...data,
      farmId,
      organizationId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Crop season created successfully',
      result: cropSeason,
    };
  }
}
