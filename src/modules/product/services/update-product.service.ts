import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isInputCostCategoryCode } from 'src/modules/cost-category/constants/input-cost-categories';
import {
  COST_CATEGORY_REPOSITORY,
  CostCategoryRepository,
} from 'src/modules/cost-category/repositories/cost-category.repository';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { UpdateProductData } from '../repositories/@types';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../repositories/product.repository';

@Injectable()
export class UpdateProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
    @Inject(COST_CATEGORY_REPOSITORY)
    private readonly costCategoryRepository: CostCategoryRepository,
  ) {}

  async execute(
    organizationId: string,
    farmId: string,
    {
      id,
      name,
      description,
      unitOfMeasurementId,
      costCategoryId,
    }: UpdateProductData,
  ) {
    const checkIfProductExists = await this.productRepository.findById(
      id,
      organizationId,
      farmId,
    );
    if (!checkIfProductExists) {
      throw new NotFoundException('Product does not exist');
    }

    if (unitOfMeasurementId) {
      const checkIfUnitOfMeasurementExists =
        await this.unitOfMeasurementRepository.findById(
          unitOfMeasurementId,
          organizationId,
        );
      if (!checkIfUnitOfMeasurementExists) {
        throw new NotFoundException('Unit of measurement does not exist');
      }
    }

    if (costCategoryId) {
      const costCategory = await this.costCategoryRepository.findById(
        costCategoryId,
        organizationId,
      );
      if (!costCategory) {
        throw new NotFoundException('Cost category does not exist');
      }
      if (!isInputCostCategoryCode(costCategory.code)) {
        throw new BadRequestException(
          'Product cost category must be an input nature category',
        );
      }
    }

    const product = await this.productRepository.update({
      id,
      name,
      description,
      unitOfMeasurementId,
      costCategoryId,
    });

    return { product };
  }
}
