import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { resolveOptionalFarmId } from 'src/common/tenancy/resolve-optional-farm-id';
import { isInputCostCategoryCode } from 'src/modules/cost-category/constants/input-cost-categories';
import {
  COST_CATEGORY_REPOSITORY,
  CostCategoryRepository,
} from 'src/modules/cost-category/repositories/cost-category.repository';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../repositories/product.repository';

type CreateProductInput = {
  name: string;
  description?: string;
  unitOfMeasurementId: string;
  costCategoryId: string;
  farmId?: string | null;
  organizationId: string;
  activeFarmId: string;
};

@Injectable()
export class CreateProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
    @Inject(COST_CATEGORY_REPOSITORY)
    private readonly costCategoryRepository: CostCategoryRepository,
  ) {}

  async execute(input: CreateProductInput) {
    const unitOfMeasurement = await this.unitOfMeasurementRepository.findById(
      input.unitOfMeasurementId,
      input.organizationId,
    );
    if (!unitOfMeasurement) {
      throw new NotFoundException('Unit of measurement does not exist');
    }

    const costCategory = await this.costCategoryRepository.findById(
      input.costCategoryId,
      input.organizationId,
    );
    if (!costCategory) {
      throw new NotFoundException('Cost category does not exist');
    }
    if (!isInputCostCategoryCode(costCategory.code)) {
      throw new BadRequestException(
        'Product cost category must be an input nature category',
      );
    }

    const farmId = resolveOptionalFarmId(input.farmId, input.activeFarmId);

    const product = await this.productRepository.create({
      name: input.name,
      description: input.description,
      unitOfMeasurementId: input.unitOfMeasurementId,
      costCategoryId: input.costCategoryId,
      organizationId: input.organizationId,
      farmId,
    });

    return { product };
  }
}
