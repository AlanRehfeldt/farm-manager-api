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
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateCropBodyDto } from '../dtos/request/create-crop.dto';
import { CreateCropResponseDto } from '../dtos/response/crop-response.dto';
import { CreateCropService } from '../services/create-crop.service';

const createCropBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  defaultProductionUomId: z.uuid().optional(),
  externalRef: z.string().max(100).nullable().optional(),
});

@ApiTags('Crop')
@FarmScoped()
@Controller('/crops')
export class CreateCropController {
  constructor(private readonly createCropService: CreateCropService) {}

  @ApiOperation({ summary: 'Create crop' })
  @ApiCreatedResponse({
    description: 'Crop created successfully',
    type: CreateCropResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Crop name already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Unit of measurement does not exist',
    type: NotFoundDto,
  })
  @Post()
  async create(
    @OrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createCropBodySchema))
    data: CreateCropBodyDto,
  ) {
    const { crop } = await this.createCropService.execute({
      ...data,
      organizationId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Crop created successfully',
      result: crop,
    };
  }
}
