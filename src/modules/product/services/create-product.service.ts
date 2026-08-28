import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { resolveOptionalFarmId } from 'src/common/tenancy/resolve-optional-farm-id';
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
  ) {}

  async execute(input: CreateProductInput) {
    const unitOfMeasurement = await this.unitOfMeasurementRepository.findById(
      input.unitOfMeasurementId,
      input.organizationId,
    );
    if (!unitOfMeasurement) {
      throw new NotFoundException('Unit of measurement does not exist');
    }

    const farmId = resolveOptionalFarmId(input.farmId, input.activeFarmId);

    const product = await this.productRepository.create({
      name: input.name,
      description: input.description,
      unitOfMeasurementId: input.unitOfMeasurementId,
      organizationId: input.organizationId,
      farmId,
    });

    return { product };
  }
}
