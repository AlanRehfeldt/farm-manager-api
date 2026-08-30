import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus, Prisma } from '@prisma/client';
import { parseDecimal } from 'src/common/serialization/decimal';
import {
  FIELD_REPOSITORY,
  FieldRepository,
} from 'src/modules/field/repositories/field.repository';
import {
  VARIETY_REPOSITORY,
  VarietyRepository,
} from 'src/modules/crop/repositories/variety.repository';
import { toCropPlantingResponse } from '../mappers/crop-season.mapper';
import {
  CROP_PLANTING_REPOSITORY,
  CropPlantingRepository,
} from '../repositories/crop-planting.repository';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from '../repositories/crop-season.repository';

type CreateCropPlantingInput = {
  cropSeasonId: string;
  fieldId: string;
  varietyId?: string | null;
  plantedAreaHa?: string | number | null;
  farmId: string;
  organizationId: string;
};

@Injectable()
export class CreateCropPlantingService {
  constructor(
    @Inject(CROP_PLANTING_REPOSITORY)
    private readonly cropPlantingRepository: CropPlantingRepository,
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
    @Inject(FIELD_REPOSITORY)
    private readonly fieldRepository: FieldRepository,
    @Inject(VARIETY_REPOSITORY)
    private readonly varietyRepository: VarietyRepository,
  ) {}

  async execute(input: CreateCropPlantingInput) {
    const cropSeason = await this.cropSeasonRepository.findById(
      input.cropSeasonId,
      input.farmId,
    );
    if (!cropSeason) {
      throw new NotFoundException('Crop season does not exist');
    }

    if (cropSeason.status === CropSeasonStatus.CLOSED) {
      throw new ConflictException(
        'Closed crop season cannot receive plantings',
      );
    }

    const field = await this.fieldRepository.findById(
      input.fieldId,
      input.farmId,
    );
    if (!field) {
      throw new NotFoundException('Field does not exist');
    }

    const duplicate = await this.cropPlantingRepository.findBySeasonAndField(
      input.cropSeasonId,
      input.fieldId,
    );
    if (duplicate) {
      throw new ConflictException(
        'Field is already linked to this crop season',
      );
    }

    if (input.varietyId) {
      const variety = await this.varietyRepository.findById(
        input.varietyId,
        input.organizationId,
      );
      if (!variety || variety.cropId !== cropSeason.cropId) {
        throw new NotFoundException('Variety does not exist for this crop');
      }
    }

    let plantedAreaHa: Prisma.Decimal | null | undefined;
    if (input.plantedAreaHa != null) {
      plantedAreaHa = parseDecimal(input.plantedAreaHa);
      if (plantedAreaHa.lte(0)) {
        throw new BadRequestException('plantedAreaHa must be greater than 0');
      }
    }

    try {
      const planting = await this.cropPlantingRepository.create({
        cropSeasonId: input.cropSeasonId,
        fieldId: input.fieldId,
        varietyId: input.varietyId,
        plantedAreaHa,
      });

      return { cropPlanting: toCropPlantingResponse(planting) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Field is already linked to this crop season',
        );
      }
      throw error;
    }
  }
}
