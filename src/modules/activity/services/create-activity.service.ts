import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityType, CropSeasonStatus } from '@prisma/client';
import {
  COST_CATEGORY_REPOSITORY,
  CostCategoryRepository,
} from 'src/modules/cost-category/repositories/cost-category.repository';
import {
  CROP_PLANTING_REPOSITORY,
  CropPlantingRepository,
} from 'src/modules/crop-season/repositories/crop-planting.repository';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from 'src/modules/crop-season/repositories/crop-season.repository';
import {
  FIELD_REPOSITORY,
  FieldRepository,
} from 'src/modules/field/repositories/field.repository';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from 'src/modules/product/repositories/product.repository';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { toCreateActivityResponse } from '../mappers/activity.mapper';
import {
  ACTIVITY_REPOSITORY,
  ActivityRepository,
} from '../repositories/activity.repository';

type CreateActivityInputItem = {
  productId: string;
  quantity: string;
};

type CreateActivityInput = {
  farmId: string;
  organizationId: string;
  cropSeasonId: string;
  fieldId: string;
  activityType: ActivityType;
  date: Date;
  note?: string | null;
  createdByUserId: string;
  inputs: CreateActivityInputItem[];
};

@Injectable()
export class CreateActivityService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: ActivityRepository,
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
    @Inject(CROP_PLANTING_REPOSITORY)
    private readonly cropPlantingRepository: CropPlantingRepository,
    @Inject(FIELD_REPOSITORY)
    private readonly fieldRepository: FieldRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
    @Inject(COST_CATEGORY_REPOSITORY)
    private readonly costCategoryRepository: CostCategoryRepository,
  ) {}

  async execute(input: CreateActivityInput) {
    const cropSeason = await this.cropSeasonRepository.findById(
      input.cropSeasonId,
      input.farmId,
    );
    if (!cropSeason) {
      throw new NotFoundException('Crop season not found');
    }

    if (cropSeason.status !== CropSeasonStatus.ACTIVE) {
      throw new ConflictException('Activities require an active crop season');
    }

    const field = await this.fieldRepository.findById(
      input.fieldId,
      input.farmId,
    );
    if (!field) {
      throw new NotFoundException('Field not found');
    }

    const planting = await this.cropPlantingRepository.findBySeasonAndField(
      input.cropSeasonId,
      input.fieldId,
    );
    if (!planting) {
      throw new BadRequestException('Field is not planted in this crop season');
    }

    const defaultCategory = await this.costCategoryRepository.findByCode(
      input.organizationId,
      'outros',
    );
    if (!defaultCategory) {
      throw new BadRequestException(
        'Default cost category not found for organization',
      );
    }

    const productMeta: Record<
      string,
      { name: string; uomAcronym: string; uomId: string }
    > = {};

    for (const item of input.inputs) {
      const quantity = Number(item.quantity);
      if (Number.isNaN(quantity) || quantity <= 0) {
        throw new BadRequestException(
          'Input quantity must be greater than zero',
        );
      }

      const product = await this.productRepository.findById(
        item.productId,
        input.organizationId,
        input.farmId,
      );
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      const uom = await this.unitOfMeasurementRepository.findById(
        product.unitOfMeasurementId,
        input.organizationId,
      );
      if (!uom) {
        throw new BadRequestException(
          `Unit of measurement not found for product ${product.name}`,
        );
      }

      productMeta[item.productId] = {
        name: product.name,
        uomAcronym: uom.acronym,
        uomId: uom.id,
      };
    }

    const { activity, stockEffects } = await this.activityRepository.create({
      farmId: input.farmId,
      cropSeasonId: input.cropSeasonId,
      fieldId: input.fieldId,
      activityType: input.activityType,
      date: input.date,
      note: input.note,
      createdByUserId: input.createdByUserId,
      inputs: input.inputs,
      productMeta,
      defaultCostCategoryId: defaultCategory.id,
    });

    return {
      activity: toCreateActivityResponse(activity, stockEffects),
    };
  }
}
